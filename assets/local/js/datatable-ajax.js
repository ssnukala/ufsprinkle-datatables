function getDatatableAjaxSettings2(final_dturl, dtoptions) {
    var settings = {
        "url": final_dturl,
        "type": "POST",
        "data": function (data) {
            return extendAjaxPostData(data, dtoptions)
        },
        "error": function (jqXHR, textStatus, errorThrown) {
            $('#' + dtoptions.htmlid + '_processing ').hide();
            showUFPageAlert(errorThrown);
        }
    };
    return settings;
}

function dtAjaxByFunction(data, callback, settings) {
    // simulate ajax call with successful data retrieval
    data = extendAjaxPostData(data, settings);
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

    myAjaxCall.then(resolveCallback, rejectCallback);
}

function extendAjaxPostData(data, dtoptions) {
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


/**
 * original example
 */
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