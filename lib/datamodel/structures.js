/**
 * @module opcua.datamodel
 */
var factories = require("./../misc/factories");

require("./diagnostic_info");

var ec = require("./../misc/encode_decode");
var assert = require('better-assert');


// TCP Error Message  OPC Unified Architecture, Part 6 page 46
// the server always close the connection after sending the TCPError message
var TCPErrorMessage_Schema = {
    name: "TCPErrorMessage",
    id: factories.next_available_id(),
    fields: [
        { name: "name", fieldType: "UInt32"},
        { name: "reason", fieldType: "String"} // A more verbose description of the error.
    ]

};
exports.TCPErrorMessage_Schema = TCPErrorMessage_Schema;
exports.TCPErrorMessage = factories.registerObject(TCPErrorMessage_Schema);


var ExtensibleParameter_Schema = {
    name: "ExtensibleParameter",
    id: factories.next_available_id(),
    // The extensible parameter types can only be extended by additional parts of this multi-part
    // specification.
    // The ExtensibleParameter defines a data structure with two elements. The parameterTypeId
    // specifies the data type encoding of the second element. Therefore the second element is specified
    // as “--“. The ExtensibleParameter base type is defined in Table 126.
    // Concrete extensible parameters that are common to OPC UA are defined in Clause 7. Additional
    // parts of this multi-part specification can define additional extensible parameter types.
    fields: [
        { name: "parameterTypeId", fieldType: "NodeId" }
        // TODO: { name: "data"}
    ]
};
exports.ExtensibleParameter_Schema = ExtensibleParameter_Schema;
factories.registerObject(ExtensibleParameter_Schema);


var ExtensibleParameterAdditionalHeader_Schema = {
    name: "ExtensibleParameterAdditionalHeader",
    id: factories.next_available_id(),
    fields: [
        { name: "parameterTypeId", fieldType: "NodeId" },
        { name: "encodingMask", fieldType: "Byte"   }
        // TODO: { name: "data"}
    ]
};
exports.ExtensibleParameterAdditionalHeader_Schema = ExtensibleParameterAdditionalHeader_Schema;
factories.registerObject(ExtensibleParameterAdditionalHeader_Schema);


// OPC Unified Architecture, Part 4  $7.29 page 139
var SessionAuthenticationToken_Schema = {
    name: "SessionAuthenticationToken",
    subtype: "NodeId"
};
factories.registerBasicType(SessionAuthenticationToken_Schema);


// OPC Unified Architecture, Part 4  $7.27 page 139
var RequestHeader_Schema = {
    name: "RequestHeader",
    fields: [

        // The secret Session identifier used to verify that the request is associated with
        // the Session. The SessionAuthenticationToken type is defined in 7.29.
        { name: "authenticationToken", fieldType: "NodeId" },

        // The time the Client sent the request.
        { name: "timeStamp", fieldType: "UtcTime", defaultValue: function () {
            return new Date();
        }  },

        // A requestHandle associated with the request. This client defined handle can
        // be used to cancel the request. It is also returned in the response.
        { name: "requestHandle", fieldType: "IntegerId", defaultValue: function () {
            return 0xDEADBEEF;
        }                 },

        // A bit mask that identifies the types of vendor-specific diagnostics to be
        // returned in diagnosticInfo response parameters.
        { name: "returnDiagnostics", fieldType: "UInt32"                     },

        // An identifier that identifies the Client's security audit log entry associated with
        // this request.
        { name: "auditEntryId", fieldType: "UAString"                   },

        { name: "timeoutHint", fieldType: "UInt32"                    },

        // Reserved for future use.
        { name: "additionalHeader", fieldType: "ExtensibleParameterAdditionalHeader" }
    ]
};

exports.RequestHeader_Schema = RequestHeader_Schema;
exports.RequestHeader = factories.registerObject(RequestHeader_Schema);

// OPC Unified Architecture, Part 4  $7.27 page 139
var ResponseHeader_Schema = {
    name: "ResponseHeader",
    fields: [
        // The time the Server sent the response.
        { name: "timeStamp", fieldType: "UtcTime", defaultValue: function () {
            return new Date();
        }  },

        // The requestHandle given by the Client to the request.
        { name: "requestHandle", fieldType: "IntegerId"                  },

        // OPC UA-defined result of the Service invocation.
        { name: "serviceResult", fieldType: "StatusCode"                 },

        { name: "serviceDiagnostics", fieldType: "DiagnosticInfo", documentation: "The diagnostics associated with the ServiceResult." },
        // There is one string in this list for each unique namespace, symbolic identifier,
        // and localized text string contained in all of the diagnostics information
        // parameters contained in the response (see 7.8). Each is identified within this
        // table by its zero-based index.
        { name: "stringTable", isArray: true, fieldType: 'String'                     },

        // Reserved for future use.
        { name: "additionalHeader", fieldType: "ExtensibleParameterAdditionalHeader" }

    ]
};

exports.ResponseHeader_Schema = ResponseHeader_Schema;
exports.ResponseHeader = factories.registerObject(ResponseHeader_Schema);


// OPC Unified Architecture, Part 4 page 16
var GetEndpointsRequest_Schema = {
    name: "GetEndpointsRequest",
    fields: [
        { name: "requestHeader", fieldType: "RequestHeader"                  },

        // The network address that the Client used to access the Discovery Endpoint .
        // The Server uses this information for diagnostics and to determine what
        // URLs to return in the response.
        // The Server should return a suitable default URL if it does not recognize
        // the HostName in the URL.
        { name: "endpointUrl", fieldType: "String"                         },

        // List of locales to use.
        // Specifies the locale to use when returning human readable strings.
        { name: "localeIds", isArray: true, fieldType: "LocaleId"               },

        // List of transport profiles that the returned Endpoints shall support.
        { name: "profileUris", isArray: true, fieldType: "String"               }

    ]
};

exports.GetEndpointsRequest_Schema = GetEndpointsRequest_Schema;
exports.GetEndpointsRequest = factories.registerObject(GetEndpointsRequest_Schema);


// see part 4 $7.14
var EnumMessageSecurityMode_Schema = {
    name: "EnumMessageSecurityMode",
    enumValues: {
        INVALID: 0, // The MessageSecurityMode is invalid
        NONE: 1, // No security is applied.
        SIGN: 2, // All messages are signed but not encrypted.
        SIGNANDENCRYPT: 3  // All messages are signed and encrypted.
    }
};
exports.EnumMessageSecurityMode_Schema = EnumMessageSecurityMode_Schema;
exports.MessageSecurityMode = factories.registerEnumeration(EnumMessageSecurityMode_Schema);

// OPC Unified Architecture, Part 4 $7.36 page 160
// This value is an enumeration with one of the following values:
//  ANONYMOUS_0     No token is required.
//  USERNAME_1      A username/password token.
//  CERTIFICATE_2   An X509v3 certificate token.
//  ISSUEDTOKEN_3    Any WS-Security defined token.
//  A tokenType of ANONYMOUS indicates that the Server does not require any
//  user identification. In this case the Client application instance Certificate is used
//  as the user identification.
var EnumUserIdentityTokenType_Schema = {
    name: "EnumUserIdentityTokenType",
    enumValues: {
        ANONYMOUS: 0,
        USERNAME: 1,
        CERTIFICATE: 2,
        ISSUEDTOKEN: 3
    }
};

exports.UserIdentityTokenType = factories.registerEnumeration(EnumUserIdentityTokenType_Schema);


var ApplicationType_Schema = {
    name: "ApplicationType",
    enumValues: {
        SERVER: 0, // The application is a Server
        CLIENT: 1, // The application is a Client
        CLIENTANDSERVER: 2, // The application is a Client and a Server
        DISCOVERYSERVER: 3  // The application is a DiscoveryServer
    }
};
exports.ApplicationType = factories.registerEnumeration(ApplicationType_Schema);

// OPC Unified Architecture, Part 4 $7.1 page 106
var ApplicationDescription_Schema = {
    name: "ApplicationDescription",
    fields: [
        // The globally unique identifier for the application instance.
        { name: "applicationUri", fieldType: "String"             },

        // The globally unique identifier for the product.
        { name: "productUri", fieldType: "String"              },
        // A localized descriptive name for the application.
        { name: "applicationName", fieldType: "LocalizedText"       },

        // The type of application.
        { name: "applicationType", fieldType: "ApplicationType" },

        // A URI that identifies the Gateway Server associated with the discoveryUrls .
        // this flag is not used if applicationType === CLIENT
        { name: "gatewayServerUri", fieldType: "String"             },

        // A URI that identifies the discovery profile supported by the URLs provided
        { name: "discoveryProfileUri", fieldType: "String"             },

        // A list of URLs for the discovery Endpoints provided by the application
        { name: "discoveryUrls", isArray: true, fieldType: "String"             }

    ]
};
exports.ApplicationDescription_Schema = ApplicationDescription_Schema;
exports.ApplicationDescription = factories.registerObject(ApplicationDescription_Schema);


// OPC Unified Architecture, Part 4 $7.36 page 160
var UserTokenPolicy_Schema = {
    name: "UserTokenPolicy",
    fields: [
        // An identifier for the UserTokenPolicy assigned by the Server.
        // The Client specifies this value when it constructs a UserIdentityToken that
        // conforms to the policy.
        // This value is only unique within the context of a single Server.
        { name: "policyId", fieldType: "String"                   },
        { name: "tokenType", fieldType: "EnumUserIdentityTokenType"},

        // This field may only be specified if TokenType is ISSUEDTOKEN.
        // A URI for the type of token. Part 7 defines URIs for supported token types.
        { name: "issuedTokenType", fieldType: "String", defaultValue: null  },

        // A optional URL for the token issuing service.
        { name: "issuerEndpointUrl", fieldType: "String", defaultValue: null  },

        // The security policy to use when encrypting or signing the UserToken when it is
        // passed to the Server in the ActivateSession request. see $7.35
        { name: "securityPolicyUri", fieldType: "String", defaultValue: null  }
    ]
};
exports.UserTokenPolicy_Schema = UserTokenPolicy_Schema;
exports.UserTokenPolicy = factories.registerObject(UserTokenPolicy_Schema);

// OPC Unified Architecture, Part 4 page 121
var EndpointDescription_Schema = {
    name: "EndpointDescription",
    fields: [
        // The URL for the Endpoint described.
        { name: "endpointUrl", fieldType: "String"       },

        // The description for the Server that the Endpoint belongs to. ( see part 4 - $7.1)
        { name: "server", fieldType: "ApplicationDescription"},

        // The application instance Certificate issued to the Server .
        //xx  { name: "serverCertificate",             fieldType: "ApplicationInstanceCertificate"  },
        { name: "serverCertificate", fieldType: "ByteString"  },

        // The type of security to apply to the messages. ( see part 4 - $7.14.)
        { name: "securityMode", fieldType: "EnumMessageSecurityMode"},

        // The URI for SecurityPolicy to use when securing messages.
        // The set of known URIs and the SecurityPolicies associated with them are defined in Part 7.
        { name: "securityPolicyUri", fieldType: "String"},

        // The user identity tokens that the Server will accept. ( see part 4 - $7.36)
        //   The Client shall pass one of the UserIdentityTokens in the ActivateSession request.
        { name: "userIdentityTokens", isArray: true, fieldType: "UserTokenPolicy"},

        // The URI of the Transport Profile supported by the Endpoint . ( see part 7)
        { name: "transportProfileUri", fieldType: "String"},

        // A numeric value that indicates how secure the EndpointDescription
        // is compared to other EndpointDescriptions for the same Server.
        // A value of 0 indicates that the EndpointDescription is not
        // recommended and is only supported for backward compatibility.
        { name: "securityLevel", fieldType: "Byte"}
    ]
};

exports.EndpointDescription_Schema = EndpointDescription_Schema;
exports.EndpointDescription = factories.registerObject(EndpointDescription_Schema);


var GetEndpointsResponse_Schema = {
    name: "GetEndpointsResponse",
    fields: [
        { name: "responseHeader", fieldType: "ResponseHeader"       },
        { name: "endpoints", isArray: true, fieldType: "EndpointDescription"  }
    ]
};

exports.GetEndpointsResponse_Schema = GetEndpointsResponse_Schema;
exports.GetEndpointsResponse = factories.registerObject(GetEndpointsResponse_Schema);


// OPC Unified Architecture, Part 4 page 106
var ApplicationInstanceCertificate_Schema = {
    // ApplicationInstanceCertificate with signature created by a Certificate Authority
    name: "ApplicationInstanceCertificate",
    id: factories.next_available_id(),

    fields: [
        // An identifier for the version of the Certificate encoding.
        { name: "version", fieldType: "String" },

        // A unique identifier for the Certificate assigned by the Issuer.
        { name: "serialNumber", fieldType: "ByteString" },

        // The algorithm used to sign the Certificate .
        // The syntax of this field depends on the Certificate encoding.
        { name: "signatureAlgorithm", fieldType: "String" },

        // The signature created by the Issuer.
        { name: "signature", fieldType: "ByteString" },

        // A name that identifies the Issuer Certificate used to create the signature.
        { name: "issuer", fieldType: "String" },

        // When the Certificate becomes valid.
        { name: "validFrom", fieldType: "UtcTime" },

        // When the Certificate expires.
        { name: "validTo", fieldType: "UtcTime" },

        // A name that identifies the application instance that the Certificate describes.
        // This field shall contain the productName and the name of the organization
        // responsible for the application instance.
        { name: "subject", fieldType: "String" },

        // The applicationUri specified in the ApplicationDescription .
        // The ApplicationDescription is described in 7.1.
        { name: "applicationUri", fieldType: "String" },

        // The name of the machine where the application instance runs.
        // A machine may have multiple names if is accessible via multiple networks.
        // The hostname may be a numeric network address or a descriptive name.
        // Server Certificates shall have at least one hostname defined.
        { name: "hostnames", isArray: true, fieldType: "String" },


        // The public key associated with the Certificate .
        { name: "publicKey", fieldType: "ByteString" },

        // Specifies how the Certificate key may be used.
        // ApplicationInstanceCertificates shall support Digital Signature, Non-Repudiation
        // Key Encryption, Data Encryption and Client/Server Authorization.
        // The contents of this field depend on the Certificate enco
        { name: "keyUsage", fieldType: "String" }

    ]
};
exports.ApplicationInstanceCertificate_Schema = ApplicationInstanceCertificate_Schema;
exports.ApplicationInstanceCertificate = factories.registerObject(ApplicationInstanceCertificate_Schema);


var EnumSecurityTokenRequestType_Schema = {
    name: "SecurityTokenRequestType",
    enumValues: {
        ISSUE: 0, //  creates a new SecurityToken for a new ClientSecureChannelLayer
        RENEW: 1  //  creates a new SecurityToken for an existing ClientSecureChannelLayer .
    }
};
exports.SecurityTokenRequestType = factories.registerEnumeration(EnumSecurityTokenRequestType_Schema);

// see OPCUA.Part4. page 22
var OpenSecureChannelRequest_Schema_as_per_SPEC_Part4 = {
    name: "OpenSecureChannelRequest",
    fields: [
        { name: "requestHeader", fieldType: "RequestHeader"                  },
        { name: "clientCertificate", fieldType: "ApplicationInstanceCertificate" },
        { name: "requestType", fieldType: "SecurityTokenRequestType"       },
        { name: "secureChannelId", fieldType: "ByteString"                     },
        { name: "securityMode", fieldType: "EnumMessageSecurityMode"        },
        { name: "securityPolicyUri", fieldType: "String"                         },
        { name: "clientNonce", fieldType: "ByteString"                     },
        { name: "requestedLifetime", fieldType: "Duration"                       }
    ]
};
// or  OPCUA.Part6. Release 1.0  6.4.4 Establishing a ClientSecureChannelLayer page 39
var OpenSecureChannelRequest_Schema_as_per_XMLSCHEMA = {
    name: "OpenSecureChannelRequest",
    fields: [
        { name: "requestHeader", fieldType: "RequestHeader"                  },
        { name: "clientProtocolVersion", fieldType: "UInt32", description: "The version of protocol used by the client"      },
        { name: "requestType", fieldType: "SecurityTokenRequestType", description: "Whether the channel is being created or renewed" },
        { name: "securityMode", fieldType: "EnumMessageSecurityMode", description: "The security mode to use with the channel."      },
        { name: "clientNonce", fieldType: "ByteString", description: "A random number generated by the client."        },
        { name: "requestedLifetime", fieldType: "UInt32", description: "The channel lifetime in milliseconds."           }
    ]
};

exports.OpenSecureChannelRequest_Schema =OpenSecureChannelRequest_Schema_as_per_XMLSCHEMA;
exports.OpenSecureChannelRequest = factories.registerObject(OpenSecureChannelRequest_Schema_as_per_XMLSCHEMA);


// OPC Unified Architecture, Part 6  page 36
var ChannelSecurityToken_Schema = {
    name: "ChannelSecurityToken",
    fields: [
        { name: "secureChannelId", fieldType: "UInt32"                     },
        { name: "tokenId", fieldType: "UInt32"                     },
        { name: "createdAt", fieldType: "UtcTime", defaultValue: function () {
            return new Date();
        }  },
        { name: "revisedLifeTime", fieldType: "UInt32", defaultValue: 30000   }
    ]
};
exports.ChannelSecurityToken_Schema =ChannelSecurityToken_Schema;
exports.ChannelSecurityToken = factories.registerObject(ChannelSecurityToken_Schema);

/**
 * @property expired
 * @type {Boolean} - True if the security token has expired.
 */
exports.ChannelSecurityToken.prototype.__defineGetter__("expired", function () {
    return (this.createdAt.getTime() + this.revisedLifeTime * 1.6) < (new Date()).getTime();
});

// documentation excerpt:
//
// SecurityTokens have a finite lifetime negotiated with this Service. However, differences between the
// system clocks on different machines and network latencies mean that valid Messages could arrive after the token has
// expired. To prevent valid Messagesfrom being discarded, the applications should do the following:
// 1.  Clients should request a new SecurityTokens after 75% of its lifetime has elapsed. This should ensure that Clients
//     will receive the new SecurityTokenbefore the old one actually expires.
// 2.  Serversshould use the existing SecurityTokento secure outgoing  Messages until the SecurityToken expires or the
//     Serverreceives a Messagesecured with a new SecurityToken.
//     This should ensure that Clientsdo not reject Messages secured with the new SecurityToken that arrive before
//     the Clientreceives the new SecurityToken.
// 3.  Clients should accept Messages secured by an expired SecurityToken for up to 25% of the token lifetime.
//     This should ensure that  Messagessent by the Serverbefore the token expired are not rejected because of
//     network delays.


var OpenSecureChannelResponse_Schema_as_per_Spec_Part4 = {
    name: "OpenSecureChannelResponse",
    fields: [
        { name: "responseHeader", fieldType: "ResponseHeader"                 },
        { name: "securityToken", fieldType: "ChannelSecurityToken"           },
        { name: "serverNonce", fieldType: "ByteString"                     }
    ]
};
var OpenSecureChannelResponse_Schema_as_per_Spec_Part6 = {
    name: "OpenSecureChannelResponse",
    fields: [
        { name: "responseHeader", fieldType: "ResponseHeader"                 },
        { name: "serverProtocolVersion", fieldType: "UInt32"                        },
        { name: "securityToken", fieldType: "ChannelSecurityToken"           },
        { name: "serverNonce", fieldType: "ByteString"                     }
    ]
};
exports.OpenSecureChannelResponse_Schema =OpenSecureChannelResponse_Schema_as_per_Spec_Part6;
exports.OpenSecureChannelResponse = factories.registerObject(OpenSecureChannelResponse_Schema_as_per_Spec_Part6);

var CloseSecureChannelRequest_Schema = {
    name: "CloseSecureChannelRequest",
    fields: [
        { name: "requestHeader", fieldType: "RequestHeader"                  }
        // { name: "secureChannelId",   fieldType: "ByteString"                     },
    ]
};
//
exports.CloseSecureChannelRequest_Schema =CloseSecureChannelRequest_Schema;
exports.CloseSecureChannelRequest = factories.registerObject(CloseSecureChannelRequest_Schema);

var CloseSecureChannelResponse_Schema = {
    name: "CloseSecureChannelResponse",
    fields: [
        { name: "responseHeader", fieldType: "ResponseHeader"                  }
    ]
};

exports.CloseSecureChannelResponse_Schema =CloseSecureChannelResponse_Schema;
exports.CloseSecureChannelResponse = factories.registerObject(CloseSecureChannelResponse_Schema);


var ServiceFault_Schema = {
    documentation: "The response returned by all services when there is a service level error.",
    name: "ServiceFault",
    fields: [
        { name: "responseHeader", fieldType: "ResponseHeader"                  }
    ],
    construct_hook: function (options) {
        var breakpoint;
        return options;
    }

};
exports.ServiceFault_Schema =ServiceFault_Schema;
exports.ServiceFault = factories.registerObject(ServiceFault_Schema);



var SignedSoftwareCertificate_Schema = {
    name: "SignedSoftwareCertificate",
    fields: [
        { name: "certificateData", fieldType: "ByteString", documentation: "The data of the certificate." },
        { name: "signature", fieldType: "ByteString", documentation: "The digital signature."}
    ]
};
exports.SignedSoftwareCertificate_Schema =SignedSoftwareCertificate_Schema;
exports.SignedSoftwareCertificate = factories.registerObject(SignedSoftwareCertificate_Schema);


// Node-opcua raised a issue in mantis => issue 2895
// BUG: the specification 1.02 says in part 4 $7.30
//   SignatureData  is "signature" + "algorithm"
//   however the schema file specifies:   "algorithm" + "signature" , Schema file is correct
var SignatureData_Schema = {
    name: "SignatureData",
    fields: [
        { name: "algorithm", fieldType: "String", defaultValue: null, documentation: "The cryptography algorithm used to create the signature." },
        { name: "signature", fieldType: "ByteString", defaultValue: null, documentation: "The digital signature."}
    ]
};
exports.SignatureData_Schema =SignatureData_Schema;
exports.SignatureData = factories.registerObject(SignatureData_Schema);

var s2 = require("./../services/session_service");
for (var name in s2) {
    exports[name] = s2[name];
}
