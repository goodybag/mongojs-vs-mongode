var i = 12344;

module.exports.getBusiness = function(){
  i++;
  return ({
  /*, _id: new ObjectId()
  ,*/ name: "biz" + i
  , publicName: "biz" + i
  , legal: {
      street1: "test"
    , city: "test"
    , state: "TX"
    , zip: 12345
    , phone: 1234567890
    }
  , locations: [
      {
        name: "biz" + parseInt(i *Math.random())
      , street1: "test"
      , city: "test"
      , state: "TX"
      , zip: 12345
      , phone: 1234567890
      }
    , {
        name: "biz" + parseInt(i *Math.random())
      , street1: "test"
      , city: "test"
      , state: "TX"
      , zip: 12345
      , phone: 1234567890
      }
    , {
        name: "biz" + parseInt(i *Math.random())
      , street1: "test"
      , city: "test"
      , state: "TX"
      , zip: 12345
      , phone: 1234567890
      }
    ]
  , managerInvitations: []
  });
};