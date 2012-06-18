/* App Controllers */

function EditContentNodeCtrl($xhr) {
    var scope;
    scope = this;

    // define data we are working with
    this.contentType   = globalContentType;
    this.contentSchema = globalContentSchema;
    this.schemaRules   = globalSchemaRules;
    this.contentNode   = globalContentNode;      // will probably be empty
    this.contentNodeId = globalContentNodeId;    // -1 if not yet saved


    this.submit = function() {
        // check whether content already exists or not
        if (this.contentNodeId < 0) {
            console.log("Going to create content ...");
            $xhr('POST', "/" + this.contentType, this.contentNode, function(code, response) {
                window.location.href =  "/?highlightId=" + response.id;
            }, function(code, response) {
                alert("PROBLEM: " + response);
            });
            return false;
        } else {
            // content already exists
            console.log("Updating content node " + this.contentNodeId + " ...");
            $xhr('PUT', "/" + this.contentType + "/" + this.contentNodeId, this.contentNode, function(code, response) {
                window.location.href =  "/?highlightId=" + response.id;
            }, function(code, response) {
                alert("PROBLEM: " + response);
            });
            return false;
        }
    };

    this.cancel = function() {
        console.log("Cancel form ...");
        window.history.back();
    };

    scope.addChild = function(ctx) {
        if (ctx.child) {
            console.log("Add child (type: " + ctx.childtype + "): " + ctx.child);
            ctx.child.push({ _type: ctx.childtype });
        } else {
            console.log("Init child (type: " + ctx.childtype + "): " + ctx.childname);
            ctx.parent[ctx.childname] = [{ _type: ctx.childtype }];
        }
    };

    scope.moveDown = function(arr) {
        var curPos = this.$index;
        var tmp = arr[curPos+1];
        arr[curPos+1] = arr[curPos];
        arr[curPos] = tmp;
    };

    scope.moveUp = function(arr) {
        var curPos = this.$index;
        var tmp = arr[curPos-1];
        arr[curPos-1] = arr[curPos];
        arr[curPos] = tmp;
    };

    scope.helper = new CalloutDialogHelper();


    // Called by referencing input element (see widget.js)
    scope.select_value = function(callout_url, field_name, field_name_secondary) {
        var fq_name = field_name;
        var fq_name_sec = field_name_secondary;
        // Special handling for array elements: insert position number
        var cur_pos = this.$index;
        if (typeof cur_pos != 'undefined') {
            var dotPos = fq_name.lastIndexOf('.');
            fq_name = fq_name.substring(0, dotPos) + '.' + cur_pos + fq_name.substring(dotPos);
            if (field_name_secondary) {
                dotPos = fq_name_sec.lastIndexOf('.');
                fq_name_sec = fq_name_sec.substring(0, dotPos) + '.' + cur_pos + fq_name_sec.substring(dotPos);
            }
        }
        var field_value = scope.$get(fq_name);
        var field_value_sec = scope.$get(fq_name_sec);

        var fields = {};
        fields[fq_name] = field_value;
        if (field_name_secondary) {
            fields[fq_name_sec] = field_value_sec;
        }

        // Create Bootbox Modal with external selection form loaded as specified by callout URL
        return bootbox.dialog(scope.helper.selection_form(callout_url, fields), [
            {
                'label': 'Cancel'
            },
            {
                'label': 'Save',
                'class': 'btn-primary success',
                'callback': function() {
                    return scope.save_values(calloutGetSelectedValues());
                }
            }
        ], {
            "animate": false
        });
    };


    // Called by referencing input element (see widget.js)
    scope.simple_select_value = function (callout_url, field_names) {
        var field_ar = field_names.split('#');
        var fields = {};
        fields["update_fields"] = Array();

        for (i in field_ar) {
            var fq_name = field_ar[i];
            if (fq_name) {
                // Special handling for array elements: insert position number
                var cur_pos = this.$index;
                if (typeof cur_pos != 'undefined') {
                    var dotPos = fq_name.lastIndexOf('.');
                    fq_name = fq_name.substring(0, dotPos) + '.' + cur_pos + fq_name.substring(dotPos);
                }

                var field_value = scope.$get(fq_name);
                fields[fq_name] = field_value;
                fields["update_fields"].push(fq_name);
            }
        }

        // Create Bootbox Modal with external selection form loaded as specified by callout URL
        return bootbox.dialog(scope.helper.selection_form(callout_url, fields), [
            {
                'label':'Cancel'
            },
            {
                'label':'Save',
                'class':'btn-primary success',
                'callback':function () {
                    return scope.save_values(calloutGetSelectedValues());
                }
            }
        ], {
            "animate":false
        });
    };


    // Called after "Save" Button in Callout-Dialog is pressed
    scope.save_values = function(doc_data) {
        jQuery.each(doc_data, function(fieldname, val) {
            if (endsWith(fieldname, "_idref")) {
                console.log("convert to int");
                scope.$set(fieldname, parseInt(val));
            } else {
                scope.$set(fieldname, val);
            }

            console.log("Updated " + fieldname + " to: " + val);
        });
        //scope.$set(fieldname, doc_data.value);
        //scope.$set('contentNode.title', doc_data.title);
        scope.$eval(); // force model update
    };

    function endsWith(str, suffix) {
        return str.indexOf(suffix, str.length - suffix.length) !== -1;
    }
}
EditContentNodeCtrl.$inject = ['$xhr'];


// ~~~ ~~~ ~~~ Utilities ~~~ ~~~ ~~~

CalloutDialogHelper = (function() {

    function CalloutDialogHelper() {}

    CalloutDialogHelper.prototype.selection_form = function(callout_url, fields) {
        // Make AJAX GET to callout_url and put inside HTML form
        setTimeout(function() {
            $.get(callout_url, fields,
                function(responseForm) {
                    $("#selection_form").html(responseForm);
                });
        }, 1); // small delay to ensure form ID is available
        return '<form id="selection_form" class="form-horizontal"></form>';
    };

    return CalloutDialogHelper;

})();
