//var page_dttables = [];

/**
 * [createDatatableOnPage description]
 * @param  {[type]} dtoptions [description]
 * @return {[type]}           [description]
 * https://datatables.net/reference/api/columns().every()
 * https://datatables.net/reference/api/columns()
 */

function createDatatableOnPage(dtoptions) {
    var oTable;
    var final_dturl;
    var oldStart = 0;
    var datatableID = "#" + dtoptions.htmlid;
    var dtbase_url = dtoptions.ajax_url;
    var fe_filter = "";
    if (jQuery("#" + dtoptions.htmlid + "_filter").length) {
        fe_filter = "&fe_filter=" + fe_filter;
    }

    final_dturl = dtbase_url + dtoptions.extra_param + fe_filter;

    jQuery.fn.dataTable.moment("MM-DD-YYYY HH:mm:ss");
    //    jQuery.fn.dataTable.moment( '  HH:mm MMM D, YY' );

    var sPlaceholder;
    var pLength;
    var ajaxSettings = getDatatableAjaxSettings(final_dturl, dtoptions.htmlid, dtoptions.filterDataCallback);

    // autolookup variables initialized here 
    var schbtn_dom = '';
    var lkpoptions = dtoptions.auto_lookup
    var lkpcols = 3; //hardcoding this here

    var dtSettings = {
        //https://datatables.net/forums/discussion/46752/the-column-render-callback-runs-too-many-times
        autoWidth: false,
        processing: true,
        serverSide: true,
        ajax: ajaxSettings,
        oSearch: {
            sSearch: dtoptions.initial_search
        },
        //searchBuilder: true,
        columns: dtoptions.columns,
        createdRow: function (row, data, index) {
            //      var thisapi = this.api();
            var fncallback = window[dtoptions.createdRow];
            var rowclass = 'dt-row';
            if (dtoptions.rowclass !== undefined) {
                rowclass += ' ' + dtoptions.rowclass;
            }
            var rowid = randomString(6, '#a');
            if (data.id !== undefined) {
                rowid = "-" + data.id + "_" + rowid;
            }
            jQuery(row).attr('id', 'dt-row-' + rowid);
            jQuery(row).addClass(rowclass);
            if (typeof fncallback === "function") {
                fncallback(row, data, index);
            }
        },
        drawCallback: function (settings) {
            var thisapi = this.api();
            var listable = thisapi.ajax.json().listable;
            if (listable !== undefined) {
                setListableFilter(settings.sTableId, listable);
            }
            //console.log("Line 72 this data is ");
            jQuery('.rs-select2').each(function () {
                if (!jQuery(this).hasClass("select2-hidden-accessible")) {
                    jQuery(this).select2({
                        minimumResultsForSearch: Infinity
                    });
                }
            });

            var fncallback = window[dtoptions.drawCallback];
            if (typeof fncallback === "function") {
                fncallback(settings);
            }
        },
        preDrawCallback: function (settings) {
            //var thisapi = this.api();
            if (dtoptions.showRowPage !== undefined) {
                var altview = jQuery("#" + settings.sTableId + '_wrapper').closest('.crdt-tabpane').find('.dt-pagerow-body');
                //var altview = jQuery("#" + settings.sTableId + '_wrapper').find('.dt-pagerow-body');
                if (!altview.length) {
                    altview = jQuery("#" + settings.sTableId + '_wrapper').find('.dt-altview-content');
                }
                if (altview.length) {
                    //console.log("Line 77 clearing the dt-altview-content div " + "#" + settings.sTableId + '_wrapper');
                    altview.html('');
                }
            }
            var fncallback = window[dtoptions.preDrawCallback];
            if (typeof fncallback === "function") {
                fncallback(settings);
            }
        },

        rowCallback: function (row, data, displayNum, displayIndex, dataIndex) {
            //var thisapi = this.api();
            var dtid = dtoptions.htmlid;
            if (dtoptions.showRowPage !== undefined) {
                var fncallback2 = window[dtoptions.showRowPage.fnCleanHTML];
                //console.log("Line 499 the rowCallback function ");
                var viewclass = 'dt-pageview-row';
                if (data.id !== undefined) {
                    viewclass = viewclass + ' dt-viewrow-' + data.id;
                }
                var htmlcontainer = jQuery('<div class="' + viewclass + '">');
                var bookhtml = '';
                if (typeof fncallback2 === "function") {
                    bookhtml = fncallback2(dtid, jQuery(row));
                } else {
                    jQuery(row).find('.rs-pageview-control').each(function () {
                        bookhtml = bookhtml + jQuery(this).html();
                    });
                }
                htmlcontainer.html(bookhtml);
                var altview = jQuery("#" + dtid + '_wrapper').closest('.crdt-tabpane').find('.dt-pagerow-body');
                if (!altview.length) {
                    altview = jQuery("#" + dtid + '_wrapper').find('.dt-altview-content');
                }
                if (altview.length) {
                    altview.append(htmlcontainer);
                    //jQuery('#' + dtid + '_wrapper').find('.dt-altview-content').append(htmlcontainer);
                }
            }
            var fncallback = window[dtoptions.rowCallback];
            if (typeof fncallback === "function") {
                fncallback(row, data, displayNum, displayIndex, dataIndex);
            }
        },

        customRenderCallback: dtoptions.customRenderCallback,
    };
    if (dtoptions.dtcustom === undefined) {
        dtSettings['dtcustom'] = {};
    } else {
        dtSettings['dtcustom'] = dtoptions.dtcustom;
    }
    //dtSettings['dtcustom'] = {};
    dtSettings['dtcustom']['ajax_url'] = final_dturl;
    dtSettings['dtcustom']['customRenderCallback'] = dtoptions.customRenderCallback;
    dtSettings['dtcustom']['name'] = dtoptions.name;
    if (dtoptions["showRowPage"] != undefined) {
        dtSettings['dtcustom']["showRowPage"] = dtoptions["showRowPage"];
    }

    // this is a custom setting to send the ajax url that came from the backend
    // this value will be used by the ajaxByFunction being set in the ajaxSettings variable above

    dtSettings = setDTCallbacks(dtSettings);

    if (dtoptions["select"] != undefined && dtoptions["select"] != "") {
        dtoptions["select"] = {
            style: 'single'
        };
    }

    if (dtoptions["ordering"] !== undefined) {
        dtSettings["ordering"] = dtoptions["ordering"];
    } else {
        dtSettings["ordering"] = true;
    }
    if (dtSettings["ordering"] && dtoptions.initial_sort !== undefined) {
        dtSettings['order'] = dtoptions.initial_sort;
    }


    dtSettings["sWrapper"] = "dataTables_wrapper srinivas uf-datatable dt-bootstrap";
    if (
        dtoptions["searchPlaceholder"] != undefined &&
        dtoptions["searchPlaceholder"] != ""
    ) {
        sPlaceholder = dtoptions["searchPlaceholder"];
    } else {
        sPlaceholder = "Filter records ...";
    }

    if (
        dtoptions["deferLoading"] != undefined &&
        dtoptions["deferLoading"] != ""
    ) {
        dtSettings["deferLoading"] = dtoptions["deferLoading"]; // here
    }

    //https://datatables.net/reference/option/language : set more options from here 
    dtSettings["language"] = {
        search: "_INPUT_",
        searchPlaceholder: sPlaceholder,
        sLengthMenu: "_MENU_",
        info: "Showing _START_ to _END_ of _TOTAL_",
        infoEmpty: "0 entries",
        infoFiltered: ""
    };
    //console.log("Line 133 export rows is " + dtoptions["export_rows"]);
    if (dtoptions["export_rows"] === 'page' || dtoptions["export_rows"] === 'all') {
        dtSettings = setDatatableExport(dtoptions, dtSettings);
    }
    if (dtoptions.scroll == "Y") {
        dtSettings["scrollY"] = 200;
        dtSettings["scrollCollapse"] = true;
        dtSettings["paging"] = false;
    } else {
        dtSettings["pageLength"] = dtoptions.pagelength;
    }

    dtSettings = setDatatableDOM(dtoptions, dtSettings);

    if (dtoptions["formatCallback"] != undefined && dtoptions["formatCallback"] != "") {
        dtSettings["formatCallback"] = dtoptions["formatCallback"];
    }

    if (dtoptions.rowGroup !== undefined) {
        dtSettings["rowGroup"] = setRowGroups(dtoptions);
    }

    if (dtoptions.rowGroup !== undefined) {
        if (dtoptions.rowGroup.table_striped === 'N') {
            jQuery(datatableID).removeClass('table-striped');
        }
    }

    oTable = jQuery(datatableID).dataTable(dtSettings);
    //oTable.searchBuilder.container().prependTo(oTable.table().container());

    /* since  dataTables.bootstrap.js  is creating the Wrapper div we will add our own classes here*/
    jQuery(datatableID + '_wrapper').removeClass('form-inline').addClass('uf-datatables');
    moveHelpText(datatableID);
    if (lkpoptions !== undefined) {
        addAutoLookupToDt(dtoptions.htmlid, lkpoptions);
    }
    var filterpos = dtoptions.filter_placement;
    if (filterpos !== undefined && filterpos.search_box !== undefined) {
        moveCustomFilters(dtoptions.htmlid);
    } else {
        setDTFilterSelect2(dtoptions.htmlid);
    }

    setupQuickEdit(dtoptions);

    stylePageLength(datatableID, dtoptions.pagelength);

    // call this function after all the datatable tasks are done
    if (dtoptions["customDTCreateCallback"] != undefined && dtoptions["customDTCreateCallback"] != "") {
        var dtcbfn = setValidCallback("customDTCreateCallback");
        dtcbfn(datatableID);
    }

    /*
    if (dtoptions["showRowPage"] !== undefined) {
        clickSelectRowShowPage(dtoptions.htmlid, dtoptions["showRowPage"]);
    }
    */
    return oTable;
}

jQuery.fn.DataTable.Api.register('buttons.exportData()', function (options) {
    if (this.context.length) {
        var innerApi = new $.fn.dataTable.Api(this.context[0]);
        var settings = innerApi.settings()[0];
        var retdata = [];
        if (settings.oInit.dtcustom.dtExportRows === false) {
            retdata = {
                'header': [],
                'body': []
            };
        } else if (settings.oInit.dtcustom.dtExportRows === 'all') {
            //dtSettings['dtExportAll']
            var ajaxurl = innerApi.ajax.url();
            var ajaxdata = innerApi.ajax.params();
            retdata = getButtonData(ajaxurl, ajaxdata);
        } else {
            var dtdata = innerApi.data();
            var expheader = [];
            if (settings.oInit.dtcustom.dtExportCols !== '*') {
                expheader = settings.oInit.dtcustom.dtExportCols;
            } else {
                jQuery.each(dtdata[0], function (hkey, hvalue) {
                    expheader.push(hkey);
                });
            }
            var expbody = [];
            var bodyrow = [];
            jQuery.each(dtdata, function (dtrowid, dtrow) {
                bodyrow = [];
                jQuery.each(expheader, function (fldseq, efield) {
                    bodyrow.push(dtrow[efield]);
                });
                expbody.push(bodyrow);
            });
            retdata['header'] = expheader;
            retdata['body'] = expbody;
        }
        return retdata;
    }
});

function setListableFilter(dthtmlid, listable) {
    var custfilter = jQuery("#" + dthtmlid + '_dtfilter');
    jQuery.each(listable, function (key, filteropts) {
        custfilter.find("select[name='" + key + "']").each(function () {
            if (jQuery(this).hasClass("select2-hidden-accessible")) {
                jQuery(this).empty();
                jQuery(this).select2({
                    minimumResultsForSearch: Infinity,
                    data: filteropts
                });
                //jQuery(this).select2("data", filteropts, true)
            } else {
                jQuery(this).select2({
                    minimumResultsForSearch: Infinity,
                    placeholder: '--select--',
                    data: filteropts
                });
            }
        });
    });
}

function setDTCallbacks(dtSettings) {
    dtSettings = setValidCallback(dtoptions.initComplete, 'initComplete', dtSettings);
    //dtSettings = setValidCallback(dtoptions.drawCallback, 'drawCallback', dtSettings);
    //dtSettings = setValidCallback(dtoptions.preDrawCallback, 'preDrawCallback', dtSettings);
    //dtSettings = setValidCallback(dtoptions.rowCallback, 'rowCallback', dtSettings);
    return dtSettings;
}

function setValidCallback(callback, fname, dtSettings) {
    var retFn = false;
    if (callback !== undefined) {
        var fncallback3 = window[callback];
        if (typeof fncallback3 === "function") {
            retFn = function (settings) {
                fncallback3(settings);
            }
        }
    }
    if (dtSettings !== undefined) {
        dtSettings[fname] = retFn;
        return dtSettings;
    } else {
        return retFn;
    }
}

function setDatatableExport(dtoptions, dtSettings) {
    if (dtoptions["export_rows"] !== undefined) {
        dtSettings['dtcustom']['dtExportRows'] = dtoptions["export_rows"];
        //dtSettings['dtExportRows'] = dtoptions["export_rows"];
    } else {
        dtSettings['dtcustom']['dtExportRows'] = false;
        //dtSettings['dtExportRows'] = false;
    }

    if (dtoptions["export_cols"] !== undefined) {
        dtSettings['dtcustom']['dtExportCols'] = dtoptions["export_cols"];
        //dtSettings['dtExportCols'] = dtoptions["export_cols"];
    } else {
        dtSettings['dtcustom']['dtExportCols'] = false;
        //dtSettings['dtExportCols'] = false;
    }
    if (dtSettings['dtcustom']['dtExportCols'] !== false) {
        button_dom = 'B'; //set this only if there is something to export
        $dtbuttons = [ //'copyHtml5',
            {
                extend: 'print',
                customize: function (win) {
                    $(win.document.body)
                        .css('font-size', '10pt')
                        .prepend(
                            '<p>RegSevak Internal Use only </p><img src="http://datatables.net/media/images/logo-fade.png" style="position:absolute; top:0; left:0;" />'
                        );
                    $(win.document.body).find('table')
                        .addClass('compact')
                        .css('font-size', 'inherit');
                },
            }, {
                extend: 'pdfHtml5',
                title: function () {
                    return "RegSevak Internal Use Only";
                },
                customize: function (doc) {
                    var twidths = [];
                    var i;
                    for (i = 0; i < doc.content[1].table.body[0].length; i++) {
                        twidths.push('auto');
                    }
                    doc.content[1].table.widths = twidths;
                },
                orientation: 'landscape',
                pageSize: 'A2',
                download: 'open'
            }, 'excelHtml5', 'csvHtml5'
        ];
        dtSettings["buttons"] = [{
            extend: 'collection',
            text: 'Export',
            className: 'dt-export-btn btn btn-xs',
            buttons: $dtbuttons
        }];
    }
    return dtSettings;
}

function setDatatableDOM(dtoptions, dtSettings) {
    // autolookup variables initialized here 
    var schbtn_dom = '';
    var lkpoptions = dtoptions.auto_lookup
    var lkpcols = 3; //hardcoding this here

    if (dtoptions.single_row === 'Y') {
        dtSettings['dtcustom']['single_row'] = 'Y';
        //dtSettings['single_row'] = 'Y'; // carry this into the frontend settings
        // this is just a single row, so no need to show search and paging
        dtSettings["dom"] = "<'dt-fulltable dtable-heading' rt>";
    } else {
        dtSettings['dtcustom']['single_row'] = 'N';
        //dtSettings['single_row'] = 'N'; // carry this into the frontend settings

        // Adding the auto lookup filter to the datatable
        var searchcol = 10;
        var alhtml = '';
        if (lkpoptions !== undefined) {
            //dtSettings['auto_lookup'] = lkpoptions;
            dtSettings['dtcustom']['auto_lookup'] = lkpoptions;
            alhtml = "<'dt-autolookup-div col-md-" + lkpcols + " col-xs-12 " + "'>";
            searchcol = searchcol - lkpcols; // = 7
        }
        var filterhtml = '';
        var filterpos = dtoptions.filter_placement;
        //if (filterpos !== undefined && filterpos === 'search_box') {
        if (filterpos !== undefined && filterpos.search_box !== undefined) {
            //filterhtml = "<'dt-customfilter'>";
            var filtercols = filterpos.search_box; //number of columns 
            filterhtml = "<'dt-customfilter-div col-md-" + filtercols + " col-xs-" + filtercols + " '>";
            searchcol = searchcol - filtercols; // = 7
        }
        var buttondom = '';
        if (dtoptions.export_rows === 'page' || dtoptions.export_rows === 'all') {
            buttondom = 'B';
        }

        if (dtoptions.pagelength !== '-1') {
            if (dtSettings['dtcustom']['dtExportCols'] !== false) {
                //schbtn_dom = alhtml + filterhtml + "<'col-md-" + searchcol + " col-xs-" + (searchcol - 1) +
                //    " search dt-search'f><'col-md-3 col-xs-4 dt-pagelength dt-snexpbtn'" + buttondom + "l>";
                schbtn_dom = alhtml + filterhtml + "<'col-md-" + searchcol + " col-xs-" + (searchcol - 1) +
                    " search dt-search dt-snexpbtn'f><'col-md-2 col-xs-2 dt-pagelength' "+ buttondom+"l>";
            } else {
                schbtn_dom = alhtml + filterhtml + "<'col-md-" + searchcol + " col-xs-" + (searchcol - 1) +
                    " search dt-search'f><'col-md-2 col-xs-3 dt-pagelength dt-snexpbtn'l>";
            }

            var dtdom1 = "<'dt-fulltable dtable-heading' " +
                //"  <'dt-customlogo pull-left'><'dt-customtitle pull-right'>" +
                "<'row dt-topbox cddatatable-topbox'" + schbtn_dom +
                //"<'col-md-2 col-xs-2 text-right dt-pagelength'l>" +
                ">r<'row dt-helpbox'<'col-md-12 col-xs-12 dt-help-content'>>" +
                "<'row dt-altview'<'col-md-12 col-xs-12 dt-altview-content'>>t";
            dtSettings["dom"] = dtdom1 + "<'dt-pager-row'" +
                "<'dt-pager-pages text-right tablesorter-pager'p><'dt-pager-countinfo'i>" +
                ">>";

        } else {
            /*dtSettings["dom"] =
                "<'dt-fulltable dtable-heading'<'row dt-topbox cddatatable-topbox '" +
                alhtml + "<'col-md-" + searchcol + " col-xs-" + searchcol +
                " search dt-search'f><'col-md-2 col-xs-2 dt-snexpbtn'" + buttondom + "> >r" +
                "<'row dt-helpbox'<'col-md-12 col-xs-12 dt-help-content'>>" +
                "<'row dt-altview'<'col-md-12 col-xs-12 dt-altview-content'>>t>S";
            */
            dtSettings["dom"] =
                "<'dt-fulltable dtable-heading'<'row dt-topbox cddatatable-topbox '" +
                alhtml + "<'col-md-" + searchcol + " col-xs-" + searchcol +
                " search dt-search dt-snexpbtn'f" + buttondom + ">>r" +
                "<'row dt-helpbox'<'col-md-12 col-xs-12 dt-help-content'>>" +
                "<'row dt-altview'<'col-md-12 col-xs-12 dt-altview-content'>>t>S";
        }
    }
    // S is for https://datatables.net/extensions/select/ : this plugin is not enabled yet
    return dtSettings;
}

function setRowGroups(dtoptions) {
    var rowGroup = {};
    rowGroup.dataSrc = dtoptions.rowGroup.dataSrc;
    rowGroup.startRender = null;
    if (dtoptions.rowGroup.startRender !== undefined) {
        var startRender = window[dtoptions.rowGroup.startRender];
        if (typeof startRender === "function") {
            rowGroup.startRender = startRender;
        }
    }
    rowGroup.endRender = null;
    if (dtoptions.rowGroup.endRender !== undefined) {
        var endRender = window[dtoptions.rowGroup.endRender];
        if (typeof endRender === "function") {
            rowGroup.endRender = endRender;
        }
    }
    var retval = false;
    if (rowGroup.endRender === null && rowGroup.startRender === null) {
        console.log("Line 198 Render Functions are null. Skipping rowGroup for " + dtoptions.htmlid);
    } else {
        retval = rowGroup;
        //dtSettings["rowGroup"] = rowGroup;
    }
    return retval;
}

function getButtonData(ajaxurl, ajaxdata, format) {
    if (format === undefined) {
        format = 'dtcsv';
    }
    ajaxdata.format = format;
    var jsonResult = $.ajax({
        url: ajaxurl,
        async: false,
        type: 'POST',
        data: ajaxdata,
        success: function (result) {
            showUFPageAlert();
            //Do nothing
        },
        error: function (jqXHR, textStatus, errorThrown) {
            showUFPageAlert(errorThrown);
        }
    });
    var retdata;
    if (jsonResult.responseJSON !== undefined) {
        retdata = jsonResult.responseJSON;
    } else {
        retdata = jsonResult;
    }

    return retdata;
}

$.fn.dataTable.render.format_column = function (column_name) {
    return function (data, type, row, meta) {
        if (type === "display") {
            var dtid = meta.settings.sTableId;
            //      console.log("Line 168 meta.settings");
            //      console.log(meta.settings);
            var crudbox = jQuery("#" + dtid).closest("div.crud-datatable");
            // Get the Crudbox so we can look for formatters inside this table, so it does not pick up other
            // formatters with the same name
            var colDiv;
            var colDiv1 = crudbox.find('div[column_formatter="' + dtid + "_" + column_name + '"]');
            if (jQuery(colDiv1).length) {
                colDiv = colDiv1;
            } else {
                var colDiv2 = crudbox.find('div[column_formatter="' + column_name + '"]');
                colDiv = colDiv2;
            }
            //      if (type === "display" && jQuery(colDiv).length) {
            if (jQuery(colDiv).length) {
                //      var colhtml = jQuery(colDiv).html();
                var colhtml = colDiv.html();
                var fncallback = window[meta.settings.oInit.dtcustom.customRenderCallback];
                if (typeof fncallback === "function") {
                    console.log("Line 193 the custom render function is " + meta.settings.oInit.dtcustom.customRenderCallback);
                    colhtml = fncallback(row, colhtml, meta);
                }
                //var colhtml = fillFieldTags(colhtml, row);
                // 3/18/20 SN : First remove the conditional html fragments
                var thishtml = removeConditionalHTML(colhtml, row, 'row.');

                var thishtml2 = replaceTokensInHTML(thishtml, [row], 'row.', '');
                /*
                    if (meta.settings.oInit.dtcustom.showRowPage !== undefined) {
                        if (column_name === meta.settings.oInit.dtcustom.showRowPage.showField) {
                            var fncallback2 = window[meta.settings.oInit.dtcustom.showRowPage.fnCleanHTML];
                            console.log("Line 499 the showRowPageClean function " + meta.settings.oInit.dtcustom.showRowPage.fnCleanHTML);
                            var viewclass = 'dt-pageview-row';
                            if (row.id !== undefined) {
                                viewclass = viewclass + ' dt-viewrow-' + row.id;
                            }
                            var htmlcontainer;
                            if (typeof fncallback2 === "function") {
                                htmlcontainer = jQuery('<div class="' + viewclass + '">').html(thishtml2);
                                htmlcontainer.html(fncallback2(dtid, htmlcontainer));
                                jQuery('#' + dtid + '_wrapper').find('.dt-altview-content').append(htmlcontainer);
                            } else {
                                var bookhtml = '';
                                htmlcontainer = jQuery('<div class="' + viewclass + '">');
                                jQuery('<div>').html(thishtml2).find('.rs-pageview-control').each(function () {
                                    bookhtml = bookhtml + jQuery(this).html();
                                });
                                htmlcontainer.html(bookhtml);
                                jQuery('#' + dtid + '_wrapper').find('.dt-altview-content').append(htmlcontainer);
                            }
                        }
                    }
                */
                return thishtml2;
            }
        }
        // Search, order and type can use the original data
        return data;
    };
};

/**
 * getDatatableAjaxSettings - sets the ajax call settings for the datatable
 * @param {*} dtURL - url for the ajax call
 * @param {*} dtId - datatable id
 * @param {*} filterDataCallback - optional callback function where the user can manipulate the ajax data
 * before it is sent for ajax call
 */

function getDatatableAjaxSettings(dtURL, dtId, filterDataCallback) {
    var settings = {
        "url": dtURL,
        "type": "POST",
        "data": function (data) {
            var retdata = extendAjaxPostData(data, dtId);
            if (typeof filterDataCallback === "function") {
                retdata = filterDataCallback(dtId, retdata);
            }
            return retdata;
        },
        /*
        "beforeSend": function (jqXHR, settings) { //this function allows to interact with AJAX object just before data is sent to server
            var skipAjax = settings.dtcustom.skipAjax;
            if (skipAjax === 'Y') { //if fake AJAX flag is set
                //get last server response
                var lastResponse = dataTable.ajax.json();
                //change draw value to match draw value of current request
                lastResponse.draw = skipAjaxDrawValue;
                //call success function of current AJAX object (while passing fake data) which is used by DataTable on successful response from server
                this.success(lastResponse);
                //reset the flag
                settings.dtcustom.skipAjax = 'N';
                return false; //cancel current AJAX request
            }
        },
        */
        "error": function (jqXHR, textStatus, errorThrown) {
            $('#' + dtId + '_processing ').hide();
            showUFPageAlert(errorThrown);
        }
    };
    return settings;
}

function extendAjaxPostData(data, dtid) {
    dtpostdata = {};
    dtpostdata[site.csrf.keys.name] = site.csrf.name;
    dtpostdata[site.csrf.keys.value] = site.csrf.value;
    // Read values
    // Srinivas Jan 2020 : Will add collecting any where criteria for data here to add to the Ajax Post 
    // this is will be sent as Filters to the,
    var filter_data = getDTFilterData(dtid);
    if (filter_data !== false) {
        dtpostdata.filters = filter_data;
    }

    var param_data = getDTParamsData(dtid);
    if (param_data !== false) {
        dtpostdata.datatable = param_data;
    }
    // Need to return this as an object or the data does not go thru properly
    var retdata = jQuery.extend({}, data, dtpostdata);
    return retdata;
}

function moveHelpText(datatableID) {
    var dtcontent = jQuery(datatableID + '_content');
    var helprow = dtcontent.find('.dt-helprow-top');
    if (helprow.length) {
        var headth = jQuery(datatableID + " > thead > tr:first > th");
        if (headth.length === 1) {
            headth.append(helprow.html());
            headth.addClass('dt-helprow-top');
        } else {
            var helpdom = dtcontent.find('.dt-help-content');
            if (helprow.length) {
                helpdom.html(helprow.html());
            }
            helpdom.addClass('dt-helprow-top');
        }
        helprow.remove();
    }
}

function moveCustomFilters(dthtmlid) {
    /**
     * TODO - need to figure out a cleaner way of doing this 
     * 
     */
    //var datatableID = ;
    var custfilter = jQuery("#" + dthtmlid + '_dtfilter');
    var filterhtml = '';
    if (custfilter.length) {
        //TODO - need to figure out a cleaner way of doing this
        custfilter.find('select').each(function () {
            if (jQuery(this).hasClass("select2-hidden-accessible")) {
                jQuery(this).select2('destroy');
            }
        });
        var filterhtml = custfilter.html();
        if (filterhtml !== undefined && filterhtml !== '') {
            var crudbox = custfilter.closest("div.crud-datatable");
            var destbox = crudbox.find('.dt-customfilter-div');
            if (destbox.length) {
                destbox.html(filterhtml);
                custfilter.remove();
            }
            //TODO - need to figure out a cleaner way of doing this
            setDTFilterSelect2(dthtmlid);
        }
    }
}

function setDTFilterSelect2(dthtmlid) {
    var crudbox = jQuery("#" + dthtmlid).closest("div.crud-datatable");
    // Enable Filter Selection Datatable Refresh now

    crudbox.find("div.datatable-filters select").select2({
        minimumResultsForSearch: Infinity,
        placeholder: '--select--'
    }).on('select2:select', function (e) {
        // Set the Hidden filter values based on this selection
        var seldata = $(e.params.data.element).data();
        setDTFilterData(dthtmlid, seldata);
        reloadDatatable(dthtmlid);

        //var filterbox = jQuery(this).closest("div.datatable-filters");
        //var oTableids1 = filterbox.attr('datatable-id');
        var thiselem = jQuery(this);
        var thisdata = thiselem.data();
        var filterdata = {};
        filterdata[thiselem.attr('name')] = thiselem.val();

        //var oTableids1 = filterbox.attr('datatable-id');
        if (thisdata.refresh_dts !== undefined) {
            var oTableids = thisdata.refresh_dts.split(',');
            jQuery.each(oTableids, function (key, oTableid) {
                //console.log("Line 92 replacing this " + oTableid);
                setDTFilterData(oTableid, filterdata);
                var loadlistable = true;
                reloadDatatable(oTableid, loadlistable);
            });
        }
    });

}

// this is not working well so not using it
function stylePageLength(datatableID, pageLength) {
    var dtsearch = jQuery(datatableID + '_filter');
    dtsearch.find('input').unwrap();
    dtsearch.find('input').addClass('input-base-elem');
    //dtsearch.addClass(' form-group '); //has-feedback input-base  input-base-filled formgen_field crud_input');
    dtsearch.addClass('form-group has-feedback input-base  input-base-select filled formgen_field crud_input');
    dtsearch.append('<span class="input-base-placeholder">Search...</span>');
    var dtlength = jQuery(datatableID + '_length');
    if (dtlength.length) {
        dtlength.addClass('form-group has-feedback input-base  input-base-select filled formgen_field crud_input');
        //var selecthtml = dtlength.find('select').outerHTML();
        var selecthtml1 = dtlength.find('label').html();
        var selecthtml2 = selecthtml1.replace('Show', '');
        dtlength.html('');
        dtlength.append(selecthtml2);
        dtlength.append('<span class="input-base-placeholder">Show</span>');

        dtlength.find('select').each(function () {
            jQuery(this).select2({
                minimumResultsForSearch: Infinity
            }).on('select2:select', function (e) {
                jQuery(datatableID).DataTable().page.len(jQuery(this).val()).draw();
            });
            jQuery(this).val(pageLength);
        });
        /*
                dtlength.find('select').select2({
                    minimumResultsForSearch: Infinity
                }).on('select2:select', function (e) {
                    jQuery(datatableID).DataTable().page.len(jQuery(this).val()).draw();
                });
        */
        //dataTables_length form-group has-feedback input-base  input-base-select filled formgen_field crud_input
        // "form-group has-feedback input-base  input-base-select filled formgen_field crud_input"
    }
}

function reInitDatatable(oTableid) {
    //var oTable = jQuery("#" + oTableid).dataTable();
    if ($.fn.DataTable.isDataTable("#" + oTableid)) {
        jQuery("#" + oTableid).DataTable().clear().destroy()
        createDatatableOnPage(dtoptions[oTableid]);
    }
    //oTable.fnReloadAjax();
}

function reloadDatatable(oTableid, getListable) {
    if (getListable === undefined) {
        getListable = false;
    }
    var oldlistval = '';
    if (getListable) {
        //var dtparams = jQuery('#' + oTableid + '_dtparams');
        var pattern = "#" + oTableid + '_dtparams ' + "  input[name='get_listable']";
        var listable = jQuery(pattern);
        if (listable.length) {
            oldlistval = listable.val();
            listable.val('Y');
        }
    }
    //var oTable = jQuery("#" + oTableid).dataTable();
    if (!$.fn.DataTable.isDataTable("#" + oTableid)) {
        createDatatableOnPage(dtoptions[oTableid]);
    } else {
        var crudbox = jQuery("#" + oTableid).closest("div.crud-datatable");
    // Enable Filter Selection Datatable Refresh now
        var filter_url = crudbox.find("div.datatable-filters select[name='filter_url']");
        if (filter_url.length) {
            var dtURL = filter_url.val();
            reloadDatatableNewURL(oTableid, dtURL);
        } else {
            var oTable = jQuery("#" + oTableid).DataTable();
            oTable.ajax.reload();
        }
    }
    if (getListable && listable.length) {
        listable.val(oldlistval);
    }

    //oTable.fnReloadAjax();
}

function reloadDatatableNewId(oTableid, newId) {
    //var oTable = jQuery("#" + oTableid).dataTable();
    var oTable = jQuery("#" + oTableid).DataTable();
    var dtURL = oTable.ajax.url();

    if (newId !== undefined) {
        //var newurl = RemoveLastDirectoryPartOf(oTable.ajax.url());
        dtURL = oTable.oInit.dtcustom.ajax_url + '/' + newId;
    }
    oTable.ajax.url(dtURL).load();
    //oTable.fnReloadAjax(dtURL, null, true);
}

function reloadDatatableNewURL(oTableid, dtURL, replaceId) {
    //var oTable = jQuery("#" + oTableid).dataTable();
    var oTable = jQuery("#" + oTableid).DataTable();

    if (replaceId !== undefined) {
        if (replaceId === 'Y') {
            //var newurl = RemoveLastDirectoryPartOf(oTable.api().ajax.url());
            var newurl = RemoveLastDirectoryPartOf(oTable.ajax.url());
            dtURL = newurl + dtURL
        }
    }
    oTable.ajax.url(dtURL).load();
    //oTable.fnReloadAjax(dtURL, null, true);
}

function reloadDatatableNewURLQuery(oTableid, query) {
    var oTable = jQuery("#" + oTableid).DataTable();
    //var oTable = jQuery("#" + oTableid).dataTable();
    var newurl = RemoveQueryPartOf(oTable.api().ajax.url());
    newurl = newurl + query
    oTable.ajax.url(newurl).load();
    //oTable.fnReloadAjax(newurl, null, true);
}

function testCreatedRow(row, data, dataIndex) {
    console.log("Line 213 CreatedRow the table row is ");
    //console.log(data);
}

function testRowCallback(row, data) {
    console.log("Line 225 RowCallback the table");
}

function testCustomRenderCallback(row, rowhtml, meta) {
    console.log("Line 225 testCustomRenderCallback the table row is will look for #widget-cg-" + row.id);
    //console.log(row);
    if (jQuery('#widget-cg-' + row.id).length) {
        jQuery('#widget-cg-' + row.id + ' .box-title').addClass('srinivas');
        console.log('Line 229: adding srinivas class to rendered HTML')
    }

}

function genericCreatedRow(row, data, dataIndex) {
    //  console.log("Line 53 CreatedRow the table row id is  " + data.id + " name is " + data.first_name);
    //  console.log(data);

    jQuery(row).find('.field_format').each(function () {
        var thissource = jQuery(this).attr('data-forfield');
        var thisdata = data;
        if (thissource !== 'rowdata') {
            thisdata = getValueFromSource(thissource, data)
        }
        //        var thisdata = data[thissource];
        var thishtml = jQuery(this).html();
        var tagarr = buildTagTree(thishtml);
        if (data.id !== undefined) {
            thishtml = thishtml.replace(/\\{row.id\\}/g, data.id);
        }
        newhtml = jQuery.trim(thishtml);
        var finalhtml = '';
        var thishtml1 = '';
        if (thisdata !== "_undefined_" && thisdata !== undefined && thisdata.length !== 0) {
            if (thishtml.indexOf('rs-conditional') !== -1) {
                thishtml1 = removeConditionalHTML(thishtml, thisdata, thissource + '.');
            } else {
                thishtml1 = thishtml;
            }

            if (Object.keys(tagarr).length > 0) {
                finalhtml = updateForEachHTML(thishtml1, data, tagarr, 0);
            } else {
                finalhtml = replaceTokensInHTML(thishtml1, thisdata, thissource); // replace the tokens from current row first
            }

            /*
                  var tokens = jQuery.unique(thishtml.match(/\{[^)]*?\}/g));
                  jQuery.each(thisdata, function (rowid, rowdata) {
                    jQuery.each(tokens, function (tid, token) {
                      //console.log("Line 92 replacing this "+'row.' + key);
                      var rowkey = new RegExp(token, "g");
                      var cleantoken = token.replace(/\{|\}/g, '');
                      newhtml = newhtml.replace(rowkey, rowdata[cleantoken]);
                    });
                    finalhtml = finalhtml + ' | ' + jQuery.trim(newhtml);
                    newhtml = jQuery.trim(thishtml);
                  });
            */
            jQuery(this).html(finalhtml);
        } else {
            jQuery(this).parent().html('');
        }
    }).replaceWith(function () {
        return $(this).contents().clone();
        //return $(this).html();
    });
}

function getDTParamsData(sTableId) {
    //var crudbox = jQuery("#" + sTableId).closest("div.crud-datatable");
    var paramsbox = jQuery("#" + sTableId + '_dtparams');
    // Srinivas : This HAS TO BE AN OBJECT :-)
    var paramdata = {};
    //var filtersource = {};
    var thisurl = '';
    var thisname = '';
    var thissource = '';
    var thisval = '';
    if (paramsbox.length) {
        var findpattern = "input:text, input:radio, select, input:hidden, textarea";
        paramsbox.find(findpattern).each(function () {
            thisname = jQuery(this).attr('name');
            thisval = jQuery(this).val();
            paramdata[thisname] = thisval;
            //filtersource[thissource] = thisval;
        });
    } else {
        paramdata = false; //just return false if no filters exist
    }
    return paramdata;
}

function getDTFilterData(sTableId) {
    var crudbox = jQuery("#" + sTableId).closest("div.crud-datatable");
    var filterbox = crudbox.find("div.datatable-filters");
    // Srinivas : This HAS TO BE AN OBJECT :-)
    var filterdata = {};
    //var filtersource = {};
    var thisurl = '';
    if (filterbox.length) {
        var findpattern = "input:text, input:radio, select, input:hidden, textarea";
        filterbox.find(findpattern).each(function () {
            thisname = jQuery(this).attr('name');
            thissource = jQuery(this).attr('data-source');
            thisval = jQuery(this).val();
            if (thisname !== 'filter_url') {
                filterdata[thisname] = thisval;
                //filtersource[thissource] = thisval;
            } else {
                thisurl = thisval; //Future use not sure if we need this for now
            }
        });
    } else {
        filterdata = false; //just return false if no filters exist
    }
    return filterdata;
}

function setDTFilterData(sTableId, data) {
    var crudbox = jQuery("#" + sTableId).closest("div.crud-datatable");
    var filterbox = crudbox.find("div.datatable-filters");
    if (filterbox.length) {
        var findpattern = "input:text, input:radio, select, input:hidden, textarea";
        filterbox.find(findpattern).each(function () {
            thisname = jQuery(this).attr('name');
            if (data[thisname] !== undefined) {
                jQuery(this).val(data[thisname]);
            }
        });
    }
}

function toggleSelectOnRowClick(shctl, oTableid) {
    var tglctl = jQuery(shctl).find('.dt-shdetail-toggle');
    if (tglctl.hasClass('glyphicon-eye-close')) {
        jQuery('#' + oTableid ).addClass('show_dt_detail').removeClass('hide_dt_detail');
        //jQuery('#' + oTableid + ' .sh-detail-blk').show();
        tglctl.removeClass('glyphicon-eye-close text-danger').addClass('glyphicon-eye-open text-info');
    } else {
        jQuery('#' + oTableid ).addClass('hide_dt_detail').removeClass('show_dt_detail');
        // jQuery('#' + oTableid + ' .sh-detail-blk').hide();
        tglctl.removeClass('glyphicon-eye-open text-info').addClass('glyphicon-eye-close text-danger');
    }
}

function toggleShDetailBlk(oTableid) {
    jQuery('#' + oTableid + ' tbody').on('click', 'tr', function () {
        if (jQuery(this).hasClass('selected')) {
            jQuery(this).removeClass('selected');
        } else {
            jQuery('#' + oTableid + ' tr.selected').removeClass('selected');
            jQuery(this).addClass('selected');
        }
    });
}

function selectRowOnClick(oTableid) {
    jQuery('#' + oTableid + ' tbody').on('click', 'tr', function () {
        var isselected = jQuery(this).hasClass('selected');
        if (!isselected) {
            jQuery('#' + oTableid + ' tr.selected').removeClass('selected');
            jQuery(this).addClass('selected');
        }
    });
}

// This will show the selected row
// will initiate this from datatable init function based on datatable setting
function clickSelectRowShowPage(oTableid, showRowPage) {
    jQuery('#' + oTableid + ' tbody').on('click', 'tr', function () {
        var isselected = jQuery(this).hasClass('selected');
        if (!isselected) {
            jQuery('#' + oTableid + ' tr.selected').removeClass('selected');
            var thisRowJq = jQuery(this);
            thisRowJq.addClass('selected');
            var fnRowPage = showRowPage.fnRowPage;
            var fncallback = window[fnRowPage];
            if (typeof fncallback === "function") {
                console.log("Line 931 calling the rowpage function");
                fncallback(oTableid, thisRowJq, showRowPage);
            } else {
                genericShowRowPage(oTableid, thisRowJq, showRowPage);
            }
        }
    });
}

function genericShowRowPage(oTableid, thisRowJq, showRowPage) {
    var oTable = jQuery("#" + oTableid)
        .dataTable()
        .api();
    var row = oTable.row(thisRowJq);
    thisdata = row.data();
    //jQuery("#" + oTableid + '_pagerow').html(thisdata[showRowPage.showField]);
    thisRowJq.find('td').each(function () {
        jQuery("#" + oTableid + '_pagerow_body').html("");
        var tdhtml = jQuery(this).html();
        var fncallback = window[showRowPage.fnCleanHTML];
        if (typeof fncallback === "function") {
            console.log("Line 931 calling the cleanhtml function");
            tdhtml = fncallback(oTableid, jQuery(this));
        }
        jQuery("#" + oTableid + '_pagerow_body').append(tdhtml);
    });
}


function clickSelectRowReloadChild(oTableid, childDTid) {
    jQuery('#' + oTableid + ' tbody').on('click', 'tr', function () {
        var isselected = jQuery(this).hasClass('selected');
        if (!isselected) {
            jQuery('#' + oTableid + ' tr.selected').removeClass('selected');
            jQuery(this).addClass('selected');
            reloadDatatable(childDTid);
        }
    });
}

function selectRowNumber(oTableid, selectRow) {
    var thisrow = jQuery('#' + oTableid + ' tbody tr:nth-child(' + selectRow + ')');
    thisrow.addClass('selected');
}

function getSelectedDTRow(oTableid) {
    var oTable = jQuery("#" + oTableid)
        .dataTable()
        .api();
    var thisdttr = jQuery('#' + oTableid + ' tr.selected');
    var row = oTable.row(thisdttr);
    return row;
}

function getDTRowData(thiselem) {
    if (jQuery.type(thiselem) === "string") {
        thisobj = jQuery("#" + thiselem);
    } else {
        thisobj = thiselem;
    }
    var thisdt = jQuery(thisobj).closest("table.dataTable");
    var thisdtid = 'not_dt';
    var thisdata = {};
    if (thisdt.length) {
        thisdtid = thisdt.attr('id');
        var thistr = jQuery(thisobj).closest("tr");
        var oTable = thisdt.dataTable().api();
        var row = oTable.row(thistr);
        thisdata = row.data();
    }
    return {
        dtid: thisdtid,
        //dtobj: thisdt,
        data: thisdata,
        //oTable: oTable,
        //thisrt: thistr
    };
}