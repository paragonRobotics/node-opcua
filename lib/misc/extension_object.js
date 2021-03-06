var factories = require("./../misc/factories");

var NodeId = require("../datamodel/nodeid").NodeId;

var ExtensionObject = function () {

};
ExtensionObject.prototype._schema = { name: "ExtensionObject" };


function constructEmptyExtensionObject(expandedNodeId) {
    return factories.constructObject(expandedNodeId);
}


var ec = require("./encode_decode");
// OPC-UA Part 6 - $5.2.2.15 ExtensionObject
// An ExtensionObject is encoded as sequence of bytes prefixed by the  NodeId of its
// DataTypeEncoding and the number of bytes encoded.

// what the specs say: OCC/UA part 6 $5.2.2.15  ExtensionObject
//
// TypeId |   NodeId  |  The identifier for the DataTypeEncoding node in the Server's AddressSpace.
//                    |  ExtensionObjects defined by the OPC UA specification have a numeric node
//                    |  identifier assigned to them with a NamespaceIndex of 0. The numeric
//                    |  identifiers are defined in A.1.
//
// Encoding | Byte    |  An enumeration that indicates how the body is encoded.
//                    |  The parameter may have the following values:
//                    |      0x00  No body is encoded.
//                    |      0x01  The body is encoded as a ByteString.
//                    |      0x02  The body is encoded as a XmlElement.
//
// Length   | Int32   |  The length of the object body.
//                    |  The length shall be specified if the body is encoded.     <<<<<<<( WTF ?)
//
// Body     | Byte[*] |  The object body
//                    |  This field contains the raw bytes for ByteString bodies.
//                    |  For XmlElement bodies this field contains the XML encoded as a UTF-8
//                    |  string without any null terminator.
//
function encodeExtensionObject(object, stream) {


    if (!object) {
        ec.encodeNodeId(ec.makeNodeId(0), stream);
        stream.writeUInt8(0x00); // no body is encoded
        //todo : verify this !!!!   Shall we store an empty length here ????
        stream.writeUInt32(0);
    } else {
        // ensure we have a valid encoding Default Binary ID !!!
        if (!object.encodingDefaultBinary) {
            console.log("xxxxxxxxx encoding ExtObj ".yellow, object);
            throw new Error("Cannot find encodingDefaultBinary for this object");
        }
        if (object.encodingDefaultBinary.isEmpty()) {
            console.log("xxxxxxxxx encoding ExtObj ".yellow, object.encodingDefaultBinary.toString());
            throw new Error("Cannot find encodingDefaultBinary for this object");
        }
        ec.encodeNodeId(object.encodingDefaultBinary, stream);
        stream.writeUInt8(0x01); // 0x01 The body is encoded as a ByteString.
        stream.writeUInt32(object.binaryStoreSize());
        object.encode(stream);
    }
}

function decodeExtensionObject(stream) {

    var nodeId = ec.decodeNodeId(stream);
    var encodingType = stream.readUInt8();

    // todo : verify this !!! check if length shall be read even when encoding == 0x0
    var length = stream.readUInt32();

    if (nodeId.value === 0 || encodingType === 0) {
        return null;
    }

    var object = constructEmptyExtensionObject(nodeId);

    if (object === null) {
        // this object is unknown to us ..
        stream.length += length;
        return null;
    }
    object.decode(stream);
    return object;
}

exports.ExtensionObject = ExtensionObject;


factories.registerBuiltInType({
    name: "ExtensionObject",
    encode: encodeExtensionObject,
    decode: decodeExtensionObject,
    defaultValue: function () {  return null;  }
});

