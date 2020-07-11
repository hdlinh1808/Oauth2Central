db.createCollection("user", {
   validator: {
      $jsonSchema: {
         bsonType: "object",
         properties: {
            apps: {
               bsonType: "array",
               uniqueItems: true,
               items: {
                  bsonType: "string",
               }
            },
            rapps: {
               bsonType: "array",
               uniqueItems: true,
               items: {
                  bsonType: "string",
               }
            }
         }
      }
   }
})
/* app */
db.createCollection("app", {
   validator: {
      $jsonSchema: {
         bsonType: "object",
         properties: {
            name: {
               bsonType: "string"
            },
            user: {
               bsonType: "array",
               uniqueItems: true,
               items: {
                  bsonType: "string",
               }
            },
         }
      }
   }
})

db.createCollection("request_app", {
   validator: {
      $jsonSchema: {
         bsonType: "object",
         properties: {
            request_app: {
               bsonType: "array",
               items: {
                  bsonType: "object",
                  properties: {
                     app: {
                        bsonType: "string",
                     },
                     uid: {
                        bsonType: "string",
                     }
                  }
               },
               uniqueItems: true,
            }
         }
      }
   }
})

db.createCollection("app", {
   validator: {
      $jsonSchema: {
         bsonType: "object",
         properties: {
            name: {
               bsonType: "string",
            },
            users: {
               bsonType: "array",
               items: {
                  bsonType: "string",
               },
               uniqueItems: true,
            }
         }
      }
   }
})

