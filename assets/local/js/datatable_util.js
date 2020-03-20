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
    //  var csrf_keyname = site.csrf.name;
    //  var csrf_key = site.csrf.value;
    if (jQuery("#" + dtoptions.htmlid + "_filter").length) {
        fe_filter = "&fe_filter=" + fe_filter;
    }

    final_dturl = dtbase_url + dtoptions.extra_param + fe_filter;

    jQuery.fn.dataTable.moment("MM-DD-YYYY HH:mm:ss");
    //    jQuery.fn.dataTable.moment( '  HH:mm MMM D, YY' );

    var sPlaceholder;
    var pLength;
    var dtSettings = {
        //https://datatables.net/forums/discussion/46752/the-column-render-callback-runs-too-many-times
        autoWidth: false,
        processing: true,
        serverSide: true,
        ajax: {
            "url": final_dturl,
            "type": "POST",
            "data": function (data) {
                dtpostdata = {
                    request: "get_dtdata",
                    dtoptions: {
                        id: dtoptions.htmlid,
                        data_options: dtoptions.data_options
                    },
                };
                dtpostdata[site.csrf.keys.name] = site.csrf.name;
                dtpostdata[site.csrf.keys.value] = site.csrf.value;
                // Read values
                // Srinivas Jan 2020 : Will add collecting any where criteria for data here to add to the Ajax Post 
                // this is will be sent as Filters to the,
                var filter_data = getDTFilterData(dtoptions.htmlid);
                if (filter_data !== false) {
                    dtpostdata.filters = filter_data;
                }
                // Need to return this as an object or the data does not go thru properly
                return jQuery.extend({}, data, dtpostdata);
            },
            "error": function (jqXHR, textStatus, errorThrown) {
                showUFPageAlert(errorThrown);
            }
        },
        oSearch: {
            sSearch: dtoptions.initial_search
        },
        order: dtoptions.initial_sort,
        columns: dtoptions.columns,
        drawCallback: function (settings) {
            //      var thisapi = this.api();
            var fncallback = window[dtoptions.drawCallback];
            if (typeof fncallback === "function") {
                fncallback(settings);
            }
        },
        preDrawCallback: function (settings) {
            //      var thisapi = this.api();
            var fncallback = window[dtoptions.preDrawCallback];
            if (typeof fncallback === "function") {
                fncallback(settings);
            }
        },
        rowCallback: function (row, data) {
            //      var thisapi = this.api();
            var fncallback = window[dtoptions.rowCallback];
            if (typeof fncallback === "function") {
                fncallback(row, data);
            }
        },
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
        customRenderCallback: dtoptions.customRenderCallback,
    };
    if (dtoptions["select"] != undefined && dtoptions["select"] != "") {
        dtoptions["select"] = {
            style: 'single'
        };
    }

    dtSettings["sWrapper"] = "dataTables_wrapper srinivas uf-datatable dt-bootstrap";
    // this is over ridden by dataTables.bootstrap.js and the wrapper classes come from there 
    /*
      / * Default class modification * /
      $.extend(DataTable.ext.classes, {
        sWrapper: "dataTables_wrapper form-inline dt-bootstrap",
        sFilterInput: "form-control input-sm",
        sLengthSelect: "form-control input-sm",
        sProcessing: "dataTables_processing panel panel-default"
      });
    */

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

    dtSettings["language"] = {
        search: "_INPUT_",
        searchPlaceholder: sPlaceholder,
        sLengthMenu: "Show _MENU_"
    };

    if (dtoptions.scroll == "Y") {
        dtSettings["scrollY"] = 200;
        dtSettings["scrollCollapse"] = true;
        dtSettings["paging"] = false;
    } else {
        dtSettings["pageLength"] = dtoptions.pagelength;
        if (dtoptions.single_row === 'Y') {
            // this is just a single row, so no need to show search and paging
            dtSettings["dom"] = "<'dt-fulltable dtable-heading' rt>S";
        } else if (dtoptions.pagelength !== '-1') {
            dtSettings["dom"] =
                "<'dt-fulltable dtable-heading' " +
                //"  <'dt-customlogo pull-left'><'dt-customtitle pull-right'>" +
                "<'row dt-topbox cddatatable-topbox '" +
                "  <'col-md-8 search dt-search'f>" +
                "  <'col-md-4 text-right dt-pagelength'l>" +
                ">r<'row dt-helpbox'<'col-md-12 dt-help-content'>>t<'row dt-pager'" +
                "  <'col-md-3 dt-countinfo 'i>" +
                "  <'col-md-9 dt-pager pager-lg1 text-right tablesorter-pager'p>" +
                " > >S";
        } else {
            dtSettings["dom"] =
                "<'dt-fulltable dtable-heading' <'row dt-topbox cddatatable-topbox '" +
                "<'col-md-12 search dt-search'f> >r<'row dt-helpbox'<'col-md-12 dt-help-content'>>t>S";
        }
    }

    if (dtoptions["formatCallback"] != undefined && dtoptions["formatCallback"] != "") {
        dtSettings["formatCallback"] = dtoptions["formatCallback"];
    }

    if (dtoptions.rowGroup !== undefined) {
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
        if (rowGroup.endRender === null && rowGroup.startRender === null) {
            console.log("Line 198 Render Functions are null. Skipping rowGroup for " + dtoptions.htmlid);
        } else {
            dtSettings["rowGroup"] = rowGroup;
        }
    }
    /*
          "<'dtable-heading' <'well1 cddatatable-topbox " +
          "row'<'col-md-9 search'f><'col-md-3 text-right'l>>rt<'row'<'col-md-3'i>" +
          "<'col-md-9 pager1 pager-lg1 text-right tablesorter-pager'p> > >S";
      "<'dtable-heading'" +
            "<'well1 cddatatable-topbox row'<'col-md-9 search'f><'col-md-3 text-right'l>>" +
            "<'row'<'col-md-12'rt>>" +
            "<'row'<'col-md-3'i><'col-md-9 pager1 pager-lg1 text-right tablesorter-pager'p>>" +
            "> S";
    */
    // S is for https://datatables.net/extensions/select/ : this plugin is not enabled yet

    if (dtoptions.rowGroup !== undefined) {
        jQuery(datatableID).removeClass('table-striped');
    }

    oTable = jQuery(datatableID).dataTable(dtSettings);
    /* since  dataTables.bootstrap.js  is creating the Wrapper div we will add our own classes here*/
    jQuery(datatableID + '_wrapper').removeClass('form-inline').addClass('uf-datatables');
    moveHelpText(datatableID);
    return oTable;
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
                var fncallback = window[meta.settings.oInit.customRenderCallback];
                if (typeof fncallback === "function") {
                    console.log("Line 193 the custom render function is " + meta.settings.oInit.customRenderCallback);
                    colhtml = fncallback(row, colhtml, meta);
                }
                //var colhtml = fillFieldTags(colhtml, row);
                // 3/18/20 SN : First remove the conditional html fragments
                var thishtml = removeConditionalHTML(colhtml, row, 'row.');

                var thishtml2 = replaceTokensInHTML(thishtml, [row], 'row.', '');
                // Srinivas 2/1 : replacing this with the {row.} format instead of row. format
                /*
                        jQuery.each(row, function (key, value) {
                          //console.log("Line 92 replacing this "+'row.' + key);
                          var rowkey = "row." + key;
                          var rowkey1 = new RegExp(rowkey, "g");
                          colhtml = colhtml.replace(rowkey1, value);
                          //console.log("Line 95 the html is "+colhtml);
                        });
                */
                return thishtml2;
            }
        }
        // Search, order and type can use the original data
        return data;
    };
};

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

function reloadDatatable(oTableid) {
    var oTable = jQuery("#" + oTableid).dataTable();
    oTable.fnReloadAjax();
}

function reloadDatatableNewURL(oTableid, dtURL, replaceId) {
    var oTable = jQuery("#" + oTableid).dataTable();
    if (replaceId !== undefined) {
        if (replaceId === 'Y') {
            var newurl = RemoveLastDirectoryPartOf(oTable.api().ajax.url());
            dtURL = newurl + dtURL
        }
    }
    oTable.fnReloadAjax(dtURL, null, true);
}

function reloadDatatableNewURLQuery(oTableid, query) {
    var oTable = jQuery("#" + oTableid).dataTable();
    var newurl = RemoveQueryPartOf(oTable.api().ajax.url());
    newurl = newurl + query
    oTable.fnReloadAjax(newurl, null, true);
}

function testCreatedRow(row, data, dataIndex) {
    console.log("Line 213 CreatedRow the table row is ");
    console.log(data);
}

function testRowCallback(row, data) {
    console.log("Line 225 RowCallback the table");
}

function testCustomRenderCallback(row, rowhtml, meta) {
    console.log("Line 225 testCustomRenderCallback the table row is will look for #widget-cg-" + row.id);
    console.log(row);
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
    });
}


function getDTFilterData(sTableId) {
    var crudbox = jQuery("#" + sTableId).closest("div.crud-datatable");
    var filterbox = crudbox.find("div.datatable-filters");
    var filterdata = {};
    //var filtersource = {};
    var returnval = {};
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

function toggleSelectOnRowClick(oTableid) {
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


/**
 * Delete
 */
function genericPreDrawFilterURLDELETE(settings) {
    var thisurl = settings.ajax.url;
    var crudbox = jQuery("#" + settings.sTableId).closest("div.crud-datatable");
    var parentdt = jQuery('#' + settings.sTableId).attr('parentdt');

    var filterbox = crudbox.find("div.datatable-filters");
    var filterdata = {};
    var filtersource = {};
    var returnval = true;

    if (filterbox.length) {
        var findpattern = "input:text, input:radio, select, input:hidden, textarea";
        filterbox.find(findpattern).each(function () {
            thisname = jQuery(this).attr('name');
            thissource = jQuery(this).attr('data-source');
            thisval = jQuery(this).val();
            filterdata[thisname] = thisval;
            filtersource[thissource] = thisval;
        });
        thisurl = filterdata.filter_url;
        jQuery.each(filterdata, function (key, value) {
            //      console.log("Line 231 the data is " + value)
            thisurl = thisurl.replace(('/' + key), ('/' + value));
        });

        settings.ajax.url = thisurl;
        console.log("Line 223 filter url is " + thisurl);
        console.log(filterdata);

        var newhtmlbox = crudbox.find('div.crud-newform, div.crud-template-new');
        jQuery.each(filtersource, function (key, value) {
            var findpattern = "[data-source^='" + key + "']";
            newhtmlbox.find(findpattern).each(function () {
                if (jQuery(this).is('input')) {
                    jQuery(this).val(value);
                } else if (jQuery(this).is('select')) {
                    jQuery(this).val(value).prop('selected', true);
                } else if (jQuery(this).is('textarea')) {
                    jQuery(this).text(value);
                }
            });
        });

    }
    return returnval;
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