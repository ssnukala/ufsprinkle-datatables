/**
 * NOT IN USE AT THIS TIME
 * Decided not to use this the following are the modified functions from datatable_util.js
 * if we use a function for Ajax then the URL is not available this is an issue with EXPORT
 * So decided not to use ajax by function for now 4/1/2020 - srinivas 
 * @param {} dtoptions 
 */



/**
 * https: //datatables.net/reference/option/ajax
 * 
 * Implementing the Ajax calls using function so we have a little more control
 * over making ajax calls or using local json data where applicable
 * 
 * @param {*} final_dturl 
 * @param {*} dtoptions 
 */

function dtAjaxByFunction(data, callback, settings, ajaxurl) {
    // simulate ajax call with successful data retrieval
    /*
    // data : datatable POST data for the ajax call
    // callback : function that will return data to the datatable
    // settings : datatable settings object
    // ajaxurl : this is a custom that Srinivas added during the initialization function
    //   so the value passed from dtoptions can be passed here for the ajax call
    */
    var ajaxdata = extendAjaxPostData(data, settings.sTableId);
    var dtAjaxCall = getAjaxPromise(ajaxurl, ajaxdata);
    dtAjaxCall.then(function resolveCallback(data) {
        // render data returned from ajax call
        callback(data);
    }, function rejectCallback(err) {
        callback({
            data: []
        });
        $(".dataTables_empty").text(err);
    });
}

function getDatatableAjaxSettings(final_dturl, dtid) {
    var settings = {
        "url": final_dturl,
        "type": "POST",
        "data": function (data) {
            return extendAjaxPostData(data, dtid)
        },
        "error": function (jqXHR, textStatus, errorThrown) {
            $('#' + dtid + '_processing ').hide();
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
    // Need to return this as an object or the data does not go thru properly
    return jQuery.extend({}, data, dtpostdata);
}

function resolveCallback(data) {
    // render data returned from ajax call
    callback(data);
}

function rejectCallback(err) {
    callback({
        data: []
    });
    $(".dataTables_empty").text(err);
}

/**
 * Decided not to use this the following are the modified functions from datatable_util.js
 * if we use a function for Ajax then the URL is not available this is an issue
 * So decided not to use ajax by function for now 4/1/2020 - srinivas 
 * @param {} dtoptions 
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
    var ajaxSettings = getDatatableAjaxSettings(final_dturl, dtoptions.htmlid);
    /* - see datatable-ajax.js for details
    4/1/2020 : decided not to use the ajax by function as the datatable URL is not available after initialization
    this is an issue for functions like export.
    // this was used for test
    if (dtoptions.ajax_by_function === 'Y') {
        ajaxSettings = function (data, callback, settings) {
            dtAjaxByFunction(data, callback, settings, final_dturl, dtoptions)
        }
    }
    */
    // autolookup variables initialized here 
    var schbtn_dom = '';
    var lkpoptions = dtoptions.auto_lookup
    var lkpcols = 3; //hardcoding this here

    var dtSettings = {
        //https://datatables.net/forums/discussion/46752/the-column-render-callback-runs-too-many-times
        autoWidth: false,
        processing: true,
        serverSide: true,
        /*
        // ajax by function so we can control the datatable a little better
        ajaxByFn: function (data, callback, settings) {
            dtAjaxByFunction(data, callback, settings, final_dturl);
        },*/
        ajax: ajaxSettings,
        oSearch: {
            sSearch: dtoptions.initial_search
        },
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
        customRenderCallback: dtoptions.customRenderCallback,
    };
    dtSettings['dtcustom'] = {};
    dtSettings['dtcustom']['ajax_url'] = final_dturl;
    dtSettings['dtcustom']['customRenderCallback'] = dtoptions.customRenderCallback;
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

    dtSettings["language"] = {
        search: "_INPUT_",
        searchPlaceholder: sPlaceholder,
        sLengthMenu: "Show _MENU_"
    };

    dtSettings = setDatatableExport(dtoptions, dtSettings);

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
        jQuery(datatableID).removeClass('table-striped');
    }

    oTable = jQuery(datatableID).dataTable(dtSettings);
    /* since  dataTables.bootstrap.js  is creating the Wrapper div we will add our own classes here*/
    jQuery(datatableID + '_wrapper').removeClass('form-inline').addClass('uf-datatables');
    moveHelpText(datatableID);
    if (lkpoptions !== undefined) {
        addAutoLookupToDt(dtoptions.htmlid, lkpoptions);
    }
    stylePageLength(datatableID);
    return oTable;
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
    oTable.ajax.url(function (data, callback, settings) {
        dtAjaxByFunction(data, callback, settings, dtURL);
    }).load();
    //oTable.ajax.url(dtURL).load();
    //oTable.fnReloadAjax(dtURL, null, true);
}

function reloadDatatableNewURLQuery(oTableid, query) {
    var oTable = jQuery("#" + oTableid).DataTable();
    //var oTable = jQuery("#" + oTableid).dataTable();
    var newurl = RemoveQueryPartOf(oTable.api().ajax.url());
    newurl = newurl + query
    oTable.ajax.url(function (data, callback, settings) {
        dtAjaxByFunction(data, callback, settings, newurl);
    }).load();
    //oTable.ajax.url(newurl).load();
    //oTable.fnReloadAjax(newurl, null, true);
}

/*
function getAjaxPromise(ajaxurl, rowdata) {
    return new Promise(function (resolve, reject) {
        $.ajax({
            url: ajaxurl,
            type: 'POST',
            data: rowdata,
            success: function (data) {
                showUFPageAlert();
                resolve(data) // Resolve promise and go to then()
            },
            error: function (jqXHR, textStatus, errorThrown) {
                showUFPageAlert(errorThrown);
                reject(jqXHR, textStatus, errorThrown) // Reject the promise and go to catch()
            }
        });
    });
}

*/
/**
 * original example
 */
/*
$('#example').dataTable({
    "columns": [{
            "data": "col1"
        },
        {
            "data": "col2"
        },
        {
            "data": "col3"
        },
    ],
    "ajax": function (data, callback, settings) {
        // simulate ajax call with successful data retrieval
        var myAjaxCall = new Promise(function (resolve, reject) {
            $(".dataTables_empty").text("Loading...");
            setTimeout(function () {
                // `callback()` expects an object with a data property whose value is either 
                // an array of arrays or an array of objects. Must be in this format
                // or you get errors.
                var ajaxData = {
                    "data": [{
                            "col1": "1.1",
                            "col2": "1.2",
                            "col3": "1.3"
                        },
                        {
                            "col1": "2.1",
                            "col2": "2.2",
                            "col3": "2.3"
                        },
                        {
                            "col1": "3.1",
                            "col2": "3.2",
                            "col3": "3.3"
                        }
                    ]
                };
                resolve(ajaxData);
            }, 1500);
        });

        myAjaxCall.then(function resolveCallback(data) {
            // render data returned from ajax call
            callback(data);
        }, function rejectCallback(err) {
            callback({
                data: []
            });
            $(".dataTables_empty").text(err);
        });
    }
});

$('#example2').dataTable({
    "columns": [{
            "data": "col1"
        },
        {
            "data": "col2"
        },
        {
            "data": "col3"
        },
    ],
    "ajax": function (data, callback, settings) {
        // simulate unsuccessful ajax call
        var myAjaxCall2 = new Promise(function (resolve, reject) {
            $(".dataTables_empty").text("Loading...");
            setTimeout(function () {
                // reject promise with error message
                reject("Something went terribly wrong!");
            }, 1500);
        });

        myAjaxCall2.then(function resolveCallback(data) {
            callback(data);
        }, function rejectCallback(err) {
            // render table with no results
            callback({
                data: []
            });
            // set dataTables empty message text to error message
            $(".dataTables_empty").text(err);
        });
    }
});
*/