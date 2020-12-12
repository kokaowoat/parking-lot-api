'use strict';

module.exports = {
  disableAllMethods: (model, methodsToExpose) => {
    if (model && model.sharedClass) {
      methodsToExpose = methodsToExpose || [];

      let modelName = model.sharedClass.name;
      let methods = model.sharedClass.methods();
      let relationMethods = [];
      let hiddenMethods = [];

      try {
        Object.keys(model.definition.settings.relations).forEach(
          function(relation) {
            relationMethods.push(
              {name: '__findById__' + relation, isStatic: false},
            );
            relationMethods.push(
              {name: '__destroyById__' + relation, isStatic: false},
            );
            relationMethods.push(
              {name: '__updateById__' + relation, isStatic: false},
            );
            relationMethods.push(
              {name: '__exists__' + relation, isStatic: false},
            );
            relationMethods.push(
              {name: '__link__' + relation, isStatic: false},
            );
            relationMethods.push(
              {name: '__get__' + relation, isStatic: false},
            );
            relationMethods.push(
              {name: '__create__' + relation, isStatic: false},
            );
            relationMethods.push(
              {name: '__update__' + relation, isStatic: false},
            );
            relationMethods.push(
              {name: '__destroy__' + relation, isStatic: false},
            );
            relationMethods.push(
              {name: '__unlink__' + relation, isStatic: false},
            );
            relationMethods.push(
              {name: '__count__' + relation, isStatic: false},
            );
            relationMethods.push(
              {name: '__delete__' + relation, isStatic: false},
            );
          },
        );
      } catch (err) {
        console.log(err);
      }

      methods.concat(relationMethods).forEach(function(method) {
        let methodName = method.name;
        if (methodsToExpose.indexOf(methodName) < 0) {
          hiddenMethods.push(methodName);
          model.disableRemoteMethod(methodName, method.isStatic);
        }
      });

      if (hiddenMethods.length > 0) {
        console.log(
          '\nRemote mehtods hidden for',
          modelName, ':',
          hiddenMethods.join(', '),
          '\n',
        );
      }
    }
  },
};
