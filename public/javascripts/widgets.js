/* http://docs.angularjs.org/#!angular.widget */

/**
 * Widget for displaying a complete form as specified by the given schema.
 */
angular.widget('my:form', function(element) {

    this.descend(true);     // compiler will process children elements
    this.directives(true);  // compiler will process directives

    return function(element) {

        var scope = this,
            schema = scope.$eval(element.attr('schema')),
            data = element.attr('data'),
            fieldset = angular.element('<fieldset></fieldset>');

        // process every field as specified in the JSON schema definition
        angular.forEach(schema, function processField(field) {
            var qualifiedName = this.parentName + '.' + field.name,
                fullyQualifiedName = this.fqName + '.' + field.name,
                fieldElStr;
            console.log("----> qualifiedName: " + qualifiedName);

            // has hierarchical subforms?
            if (field.children) {
                var contentChilds = scope.$eval(qualifiedName);
                var childElem = field.name + 'Elem';
                if (!contentChilds) {
                    var propName = fullyQualifiedName.substr('contentNode'.length + 1);
                    console.log("WARN:  No content childs for " + propName);
                    // var propNameArr = propName.split('.');
                } else {
                    console.log("      ----> fieldset ng:repeat=" + childElem + " in " + qualifiedName);
                    // Nesting of ng:repeat must use relative variable reference names
                }
                // ~~~~~~ construct subform
                var subfieldset = angular.element('<fieldset></fieldset>');
                var legend = angular.element('<legend>' + field.label + '</legend>');
                // ~~ add button (should be available anytime)
                var addButton = angular.element('<a href="#" ng:click="' + qualifiedName + '.$add()"><i class="icon-plus" title="Add"></i></a>');
                legend.append(addButton);
                subfieldset.append(legend);
                //
                var childGroup = angular.element('<div ng:repeat="' + childElem + ' in ' + qualifiedName + '"></div>');
                // ~~ remove (per individual child group)
                var removeButton = angular.element('<a href="#" ng:click="' + qualifiedName + '.$remove(' + childElem + ')"><i class="icon-minus" title="Remove"></i></a>');
                childGroup.append(removeButton);
                subfieldset.append(childGroup);
                // ~~
                this.curDOMParent.append(subfieldset);
                angular.forEach(field.children, processField, {parentName: childElem, fqName: fullyQualifiedName, curDOMParent: subfieldset});
                console.log("~~ after add children   -> " + qualifiedName);
                if (qualifiedName == 'teasersElem.childteasers') {
                    console.log("childteasers finished: " + this.curDOMParent);
                    // this.curDOMParent.append(fieldset);
                } else if (qualifiedName == 'contentNode.teasers') {
                    console.log("teasers finished: " + this.curDOMParent);
                    // this.curDOMParent.append(fieldset);
                }
                return;
            }

            switch (field.type || 'text') {
                case 'reference': {
                    fieldElStr = '<input disabled name="' + qualifiedName + '" ';

                    angular.forEach(field, function(value, attribute) {
                        if (attribute != 'tag') {
                            fieldElStr += attribute + '="' + value + '" ';
                        }
                    });

                    fieldElStr += '><a href="#" ng:click="select_value({\'key\':\'ref\'})">Select</a>';

                    break;
                }
                case 'checkbox':; //fallthrough
                case 'password':; //fallthrough
                case 'text': {
                    fieldElStr = '<input name="' + qualifiedName + '" ';

                    angular.forEach(field, function(value, attribute) {
                        if (attribute != 'tag') {
                            fieldElStr += attribute + '="' + value + '" ';
                        }
                    });

                    fieldElStr += '>';
                    break;
                }
                case 'textarea': {
                    fieldElStr = '<textarea name="' + qualifiedName + '" ';

                    angular.forEach(field, function(attribute) {
                        fieldElStr += attribute + '="' + field[attribute] + '" ';
                    });

                    fieldElStr += '></textarea>';
                    break;
                }
            }

            var controlGroup = angular.element('<div class="control-group"></div>');

            controlGroup.append(angular.element('<label class="control-label" for="' + qualifiedName + '">' + field.label + '</label>'));
            var controlElem = angular.element('<div class="controls">');
            controlElem.append(fieldElStr);
            controlGroup.append(controlElem);
            console.log("****** append to " + qualifiedName);
            this.curDOMParent.append(controlGroup);

        }, {parentName: data, fqName: data, curDOMParent: fieldset});

        angular.compile(fieldset)(scope);
        element.append(fieldset);
    };
});

