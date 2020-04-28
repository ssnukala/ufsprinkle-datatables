function setupQuickEdit(dtoptions) {
    if (dtoptions.quick_edit !== undefined) {
        //moveQuickEditCheckbox(dtoptions.htmlid);
        jQuery('#' + dtoptions.htmlid + '_qeform').ufForm({
            validator: {},
            msgTarget: $("#cr-crudpage-alerts"),
            showAlertOnSuccess: true,
            binaryCheckboxes: false
        }).on("submitSuccess.ufForm", function (event, data, textStatus, jqXHR) {
            // we will send the htmlid of the form to the call back so the call back
            // has the context of where the request is coming from
            var ufCallback = (window || this)[dtoptions.quick_edit.ufCallback];
            //if (typeof (window || this)[rsOnSuccess] === "function") {
            if (typeof ufCallback === "function") {
                ufCallback(event, data, textStatus, jqXHR, dtoptions.htmlid); // 
            }
            showHideQuickEdit(dtoptions.htmlid, 'hide');
            reloadDatatable(dtoptions.htmlid);
        });
    }
}

function genericDTQuickEdit(thiselem, prefix) {
    var cruddtdiv = jQuery(thiselem).closest("div.crud-datatable");
    var thistable = jQuery(cruddtdiv).find("table.dataTable");
    var dthtmlid = thistable.attr('id');
    //var thisdt = jQuery("#" + dthtmlid).DataTable();
    var thisdt = thistable.DataTable();
    // Can wrap the table with a form tag, but will have to add the buttons etc, 
    // so may be just read the values and dynamically submit using form tag outside the table
    //jQuery("#" + dthtmlid).wrap('<form id="' + dthtmlid + '_qeform"  action="' + formurl + '" type="POST"></form>');
    var qediv = jQuery(thiselem).closest('div.dt-quickedit');

    showHideQuickEdit(dthtmlid, 'show');

    var qediv = cruddtdiv.find('div[column_formatter="' + dthtmlid + '_quick_edit"]');
    var fieldhtml = {};
    qediv.find('.dt-quickedit-field').each(function () {
        var forfield = jQuery(this).attr('data-forfield');
        fieldhtml[forfield] = jQuery(this).html();
    });
    //var fieldtdjq1 = thisdt.columns(':not(.never).dt_column').nodes().toJQuery();
    var fielddata = thisdt.columns(':not(.never).dt_column').nodes().data()

    //TODO should we just use the render call back function to format the folumn 
    // or just stick to the quick edit formatter ? 
    //thisdt.settings()[0].aoColumns[0].mRender

    jQuery.each(fieldhtml, function (colname, colhtml) {
        var thisfld = colname.replace(prefix + '.', '').replace('.', '_').trim();
        var fieldtdjq = thisdt.columns(':not(.never).dt_column.' + thisfld).nodes().toJQuery();
        if (fieldtdjq.length) {
            jQuery.each(fieldtdjq[0], function (rowid, fieldcoljq) {
                jQuery(fieldcoljq).addClass('dt-quickedit-on');
                var thisdata = fielddata[rowid];
                //var thishtml = colhtml.replace('{row.id}', thisdata.id);
                var thishtml = replaceTokensInHTML(colhtml, [thisdata], 'row.', '');
                var qeblock = jQuery(fieldcoljq).find('.dt-quickedit-block');
                if (qeblock.length) {
                    qeblock.html(thishtml);
                } else {
                    jQuery(fieldcoljq).html(thishtml);
                }
                jQuery(fieldcoljq).find('select').each(function () {
                    var datafld = jQuery(this).attr('data-source').replace(prefix + '.', '').replace('.', '_').trim();
                    var tfldval = (thisdata[datafld] === 'null' || thisdata[datafld] === undefined) ? '' : thisdata[datafld];
                    jQuery(this).val(tfldval);
                    jQuery(this).select2({
                        minimumResultsForSearch: Infinity,
                        placeholder: '--select--'
                    });
                });
            });
        }
    });
}

function showHideQuickEdit(htmlid, action) {
    var qediv = jQuery("#" + htmlid + '_quickedit_div');
    var cruddtdiv = qediv.closest("div.crud-datatable");
    if (action === 'hide') {
        qediv.find('.dt-quickedit-check').show();
        qediv.find('.dt-quickedit-check input:checkbox').prop("checked", false);
        qediv.find('.dt-quickedit-form').hide();
        cruddtdiv.find('.dt-topbox').show();
        cruddtdiv.find('.dt-head').removeClass('dt-editing');
    } else {
        qediv.find('.dt-quickedit-check').hide();
        //qediv.find('.dt-quickedit-check input:checkbox').prop("checked", false);
        qediv.find('.dt-quickedit-form').show();
        cruddtdiv.find('.dt-topbox').hide();
        cruddtdiv.find('.dt-head').addClass('dt-editing');
    }
}

function onQuickEditSubmit(thisform, prefix) {
    var cruddtdiv = jQuery(thisform).closest("div.crud-datatable");
    var thistable = jQuery(cruddtdiv).find("table.dataTable");
    var findpattern = "input:text, input:radio, select, input:hidden, textarea";
    var thisjq = jQuery(thisform);
    var ids = '';
    var delim = '';
    thistable.find('.dt-quickedit-field ' + findpattern).each(function () {
        var newelem = jQuery('<input>', {
            type: 'hidden',
            name: jQuery(this).attr('name'),
            value: jQuery(this).val()
        });
        /*
        if ((this).attr('data-source') === prefix + '.id') {
            ids = ids + delim + jQuery(this).val();
            delim = ',';
        }
        */
        thisjq.append(newelem);
    });
    /*
    var idelem = jQuery('<input>', {
        type: 'hidden',
        name: jQuery(this).attr('ids'),
        value: jQuery(this).val()
    });
    */

}

function genericQuickEditCancel(cancelbutton) {
    var cruddtdiv = jQuery(cancelbutton).closest("div.crud-datatable");
    //var outerdiv = jQuery(cancelbutton).closest('div.dt-quickedit');
    if (cruddtdiv.length) {
        var thistable = jQuery(cruddtdiv).find("table.dataTable");
        showHideQuickEdit(thistable.attr('id'), 'hide');
        var thisdt = thistable.DataTable();
        if (thisdt) {
            thisdt.ajax.reload();
        }
    } else {
        jQuery(cancelbutton).closest("form").hide();
    }
    return false;
}

function moveQuickEditCheckbox(dthtmlid) {
    var qediv = jQuery("#" + dthtmlid + '_quickedit_div');
    var qehtml = '';
    if (qespan.length) {
        var qeid = qespan.attr('id');
        var qeclass = qespan.attr('class');
        //TODO - need to figure out a cleaner way of doing this
        var qehtml = qespan.html();
        if (qehtml !== undefined && qehtml !== '') {
            //var crudbox = qespan.closest("div.crud-datatable");
            qediv.remove();
            var dtable = jQuery("#" + dthtmlid);
            if (dtable.length) {
                var qediv1 = jQuery('<div>', {
                    class: qeclass,
                    id: dthtmlid + '_quickedit_div'
                }).html(qehtml);
                dtable.before(qediv1);
            }
        }
    }
}

function addQuickEditCheckbox(dtoptions) {
    var editcheck = '';
    if (dtoptions.quick_edit !== undefined) {
        var qefunction = dtoptions.quick_edit.onClick;
        if (qefunction === undefined) {
            qefunction = 'genericDTQuickEdit';
        }
        editcheck = '<span class="dt-quickedit">' +
            '<input type="checkbox" class="dt-quickedit-check" name="dt_quickedit" value=""' +
            'id="' + dtoptions.htmlid + +'_quickedit"' +
            'onClick="' + qefunction + '("' + dtoptions.quick_edit.url + '","' + dtoptions.quick_edit.prefix + '") >' +
            '<label for="' + dtoptions.htmlid + +'_quickedit">Quick Edit</label></span>';

    }
}