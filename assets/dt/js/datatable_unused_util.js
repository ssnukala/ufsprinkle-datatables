/*
 * Srinivas TODO : Check this API syntax
jQuery.fn.dataTable.Api.register('column().title()', function () {
    var colheader = this.header();
    return jQuery(colheader).text().trim();
});
*/
function hideDetailRow_DT(oTableid, buttonthis) {
    if (oTableid !== "none") {
        //                reloadDatatable(oTableid);
        var oTable_full = [];
        oTable_full = page_dttables[oTableid];
        var oTable = oTable_full["dtobject"];
        var tr = jQuery(buttonthis)
            .closest("tr")
            .prev();
        var row = oTable.api().row(tr);
        row.child.hide();
        tr.removeClass("shown");
    }
}

function onClickEditRow(oTableid, par_this) {
    var tr = jQuery(par_this).closest("tr");
    //    var oTable_full = [];
    //    oTable_full = page_dttables[oTableid];
    //    var oTable = oTable_full['dtobject'];
    var oTable = jQuery("#" + oTableid).dataTable();
    //alert("Line 430");
    var row = oTable.api().row(tr);
    //            var row = oTable.api().row(tr[0]);
    if (row.child.isShown()) {
        // This row is already open - close it
        row.child.hide();
        tr.removeClass("shown");
    } else {
        // Open this row
        row.child(showEditRow_Generic(oTableid, row.data())).show();
        tr.addClass("shown");
    }
}

function showEditRow_Generic_table(oTableid, d) {
    var var_rethtml2 = "";
    var var_i = 0;
    var var_colspan = 4;
    var var_rid;
    var oTable_full = [];
    var oTable_full = page_dttables[oTableid];
    var oTable_options = oTable_full["dtoptions"];

    jQuery.each(d, function (v_index, v_value) {
        //                var var_label = var_col(index).header();
        var var_label = oTable_options["fields"][v_index]["frm_label"];

        if (v_index === "id") {
            var_rid = jQuery(v_value)
                .text()
                .replace("ID-", "");
            var_rethtml2 +=
                '<input type="hidden" name="' + v_index + '" value="' + var_rid + '"/>';
            var_i--;
        } else if (v_index === "status") {
            //                    var var_label = oTable.api().column(var_i).title();

            var sel_clone = jQuery("#record_status_div_i").html();
            if (v_value === "A") sel_clone.replace('value="A"', 'selected value="A"');
            else sel_clone.replace('value="I"', 'selected value="I"');
            //                    var_rethtml2 += '<td style="border:none;">'+var_label+':<br> <input tyle="text" id="'+v_index+'_i" name="erec['+index+']" value="'+value+'"/>' + '</td>';
            var_rethtml2 +=
                '<td style="border:none;">' +
                var_label +
                ":<br> " +
                sel_clone +
                "</td>";
        } else {
            //                    var var_label = oTable.api().column(var_i).title();
            //                    var var_label = thisdt_cols[v_index];
            var_rethtml2 +=
                '<td style="border:none;">' +
                var_label +
                ':<br> <input tyle="text" id="' +
                v_index +
                '_i" name="erec[' +
                v_index +
                ']" value="' +
                v_value +
                '"/>' +
                "</td>";
        }
        //                if (var_i!==0 && var_i % 4 === 0)
        if (var_i === 3) {
            var_rethtml2 += '</tr><tr class="editrow_' + var_i + '">';
            var_colspan = 4;
            var_i = 0;
        } else {
            var_i++;
            var_colspan--;
        }
    });

    var var_rethtml1 =
        '<form action="#" role="form" method="post" class="inline_edit_frm" id="inlineedit_i_' +
        var_rid +
        '" ' +
        'enctype="multipart/form-data" onSubmit="submitEditRowForm( \'' +
        var_rid +
        "', '" +
        oTable_options["htmlid"] +
        "',this);return false;\"> " +
        '<input type="hidden" name="erec[id]" value="' +
        var_rid +
        '">' +
        '<div style="text-align:center;"><b>Edit Record </b><span style="padding:0px 5px;margin:0px 5px;" id="inlineedit_i_' +
        var_rid +
        '_result"></span></div>' +
        '<table width="100%" cellpadding="5" cellspacing="0" border="1" style="background:white;padding:0px 15px;"><tr>' +
        var_rethtml2 +
        '<td style="border:none;text-align:right;" colspan="' +
        var_colspan +
        '">' +
        '<button class="portal_btn_class ">Save</button></td></tr>' +
        "</table></form>";
    return var_rethtml1;
}

function showEditRow_Generic(oTableid, d) {
    var var_rethtml2 = "";
    var var_i = 0;
    var var_colspan = 12;
    var var_rid;
    var dtfldclass;

    var oTable_full = [];
    var oTable_full = page_dttables[oTableid];
    var oTable_options = oTable_full["dtoptions"];

    jQuery.each(d, function (v_index, v_value) {
        //                var var_label = var_col(index).header();
        var thisdfld = (var_label = oTable_options["fields"][v_index]);
        var var_label = oTable_options["fields"][v_index]["label"];

        if (thisdfld.showin_editform === "Y") {
            if (v_index === "id") {
                var_rid = jQuery(v_value)
                    .text()
                    .replace("ID-", "");
                var_rethtml2 +=
                    '<input type="hidden" name="' +
                    v_index +
                    '" value="' +
                    var_rid +
                    '"/>';
                var_i--;
            } else if (v_index === "status") {
                //                    var var_label = oTable.api().column(var_i).title();

                var sel_clone = jQuery("#record_status_div_i").html();
                if (v_value === "A")
                    sel_clone.replace('value="A"', 'selected value="A"');
                else sel_clone.replace('value="I"', 'selected value="I"');
                //                    var_rethtml2 += '<td style="border:none;">'+var_label+':<br> <input tyle="text" id="'+v_index+'_i" name="erec['+index+']" value="'+value+'"/>' + '</td>';
                //                    var_rethtml2 += '<div class="col-md-4">' + var_label  + sel_clone + '</div>';
                var_rethtml2 +=
                    '<div class="col-md-4"> <div class="form-group "> ' +
                    '<label id="id_i" class="control-label ">' +
                    var_label +
                    "</label>" +
                    sel_clone +
                    "</div></div>";
            } else {
                //                    var var_label = oTable.api().column(var_i).title();
                //                    var var_label = thisdt_cols[v_index];
                if (thisdfld.type === "datetime") dtfldclass = "datepicker";
                else dtfldclass = "";

                var_rethtml2 +=
                    '<div class="col-md-4"> <div class="form-group">' +
                    '<label id="id_i" class="control-label">' +
                    var_label +
                    "</label> " +
                    '<input type="text" class="' +
                    dtfldclass +
                    ' input-sm  form-control " style="width:100%" placeholder="' +
                    var_label +
                    '" ' +
                    'id=" ' +
                    v_index +
                    '_i" name="erec[' +
                    v_index +
                    ']" value="' +
                    v_value +
                    '"/>' +
                    "</div></div>";
            }
            //                if (var_i!==0 && var_i % 4 === 0)
            if (var_i === 2) {
                var_rethtml2 +=
                    '</div><div class="row ' + var_i + '" style="padding:5px;">';
                var_colspan = 12;
                var_i = 0;
            } else {
                var_i++;
                var_colspan = var_colspan - 4;
            }
        }
    });

    var var_rethtml1 =
        '<div class="panel panel-default"> ' +
        '<div class="panel-heading">' +
        '<h3 class="panel-title">Edit Row</h3>' +
        '<span style="padding:0px 5px;margin:0px 5px;" id="inlineedit_i_' +
        var_rid +
        '_result">' +
        "</span>" +
        "</div> " +
        '<div class="panel-body">' +
        '<form action="#" role="form" method="post" class="form-horizontal inline_edit_frm" id="inlineedit_i_' +
        var_rid +
        '" ' +
        'enctype="multipart/form-data" onSubmit="submitEditRowForm( \'' +
        var_rid +
        "', '" +
        oTable_options["htmlid"] +
        "',this);return false;\"> " +
        '<input type="hidden" name="erec[id]" value="' +
        var_rid +
        '">' +
        '<div class="row" style="padding:5px;">' +
        var_rethtml2 +
        '<div class="col-md-' +
        var_colspan +
        '">' +
        '<button class="btn btn-primary portal_btn_class ">Save</button></div>' +
        '</div></form> <script>jQuery(".datepicker").datepicker({ format:"m/d/Y H:i:s"});</script>';
    return var_rethtml1;
}

function submitEditRowForm(recid, oTableid, par_form) {
    //    var oTable_full = [];
    //    var oTable_full = page_dttables[oTableid];
    //    var oTable_options = oTable_full['dtoptions'];
    //    var oTable = oTable_full['dtobject'];
    //
    var wp_ajaxurl = "/savedata/specifysavesource";
    var formData = jQuery(par_form).serialize();
    var t_formid = jQuery(par_form).attr("id");

    jQuery.ajax({
        url: wp_ajaxurl,
        type: "get",
        data: formData,
        success: function (retval) {
            if (retval !== "") {
                jQuery("#" + t_formid + "_result").html(retval);
                //                        oTable.fnReloadAjax();
            }
        }
    });
    return false;
}

function onClickAjaxEditRow(oTableid, par_this, par_id, par_options) {
    if (par_options === "undefined") par_options = [];

    var oTable_full = [];
    oTable_full = page_dttables[oTableid];
    //    var oTable = oTable_full['dtobject'];
    var oTable = jQuery("#" + oTableid).dataTable();

    var oTable_options = oTable_full["dtoptions"];
    var odata_options = oTable_options["data_options"];

    var postdtopts = {
        id: oTable_options.htmlid,
        data_options: odata_options
    };
    var tr = jQuery(par_this).closest("tr");
    //alert("Line 430");
    var row = oTable.api().row(tr);
    //            var row = oTable.api().row(tr[0]);
    if (row.child.isShown()) {
        // This row is already open - close it
        row.child.hide();
        tr.removeClass("shown");
    } else {
        var submit_button_text = jQuery(par_this).html();
        jQuery(par_this).prop("disabled", true);
        jQuery(par_this).html("<i class='fa fa-spinner fa-spin'></i>");

        // Open this row
        var var_formurl = oTable_options.process_url + "/editform";
        //            var var_formurl = oTable_options.ajax_url + '/' + par_id + '/editform';
        var var_retform = getFormContent(
            var_formurl,
            par_id,
            postdtopts,
            par_options
        );
        jQuery(par_this).prop("disabled", false);
        jQuery(par_this).html(submit_button_text);

        if (var_retform !== false) {
            row.child(var_retform).show();
            tr.addClass("shown");
        } else return false;
    }
}

function getFormContent(par_ajaxurl, par_id, postdtopts, par_options) {
    if (par_options === "undefined" && par_options === "") par_options = [];
    var ret_html = "";
    jQuery.ajax({
        url: par_ajaxurl,
        type: "post",
        data: {
            id: par_id,
            options: par_options,
            request: "get_editform",
            csrf_token: jQuery("meta[name=csrf_token]").attr("content"),
            dtoptions: postdtopts
        },
        async: false,
        //            datatype: "html",
        //                data: formData,
        success: function (ret_data, status, xhr) {
            try {
                var ret_data1 = JSON.parse(ret_data);
                ret_html = ret_data1.html;
            } catch (e) {
                ret_html = ret_data;
            }
        }
    });
    return ret_html;
}