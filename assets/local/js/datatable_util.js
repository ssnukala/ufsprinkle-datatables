var page_dttables = [];

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
  var divid = "#" + dtoptions.htmlid;
  var dtbase_url = dtoptions.ajax_url;
  var fe_filter = "";
  //  var csrf_keyname = site.csrf.name;
  //  var csrf_key = site.csrf.value;
  if (jQuery("#" + dtoptions.htmlid + "_filter").length) {
    fe_filter = "&fe_filter=" + fe_filter;
  }

  final_dturl = dtbase_url + dtoptions.extra_param + fe_filter;
  var dtpostdata = {
    request: "get_idtdata",
    dtoptions: {
      id: dtoptions.htmlid,
      data_options: dtoptions.data_options
    }
  };
  dtpostdata[site.csrf.keys.name] = site.csrf.name;
  dtpostdata[site.csrf.keys.value] = site.csrf.value;

  jQuery.fn.dataTable.moment("MM-DD-YYYY HH:mm:ss");
  //    jQuery.fn.dataTable.moment( '  HH:mm MMM D, YY' );

  var sPlaceholder;
  var dtOptions = {
    processing: true,
    serverSide: true,
    ajax: {
      url: final_dturl,
      type: "POST",
      data: dtpostdata
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
      if (typeof fncallback === "function") {
        fncallback(row, data, index);
      }
    }
  };

  dtOptions["sWrapper"] = "dataTables_wrapper uf-datatable dt-bootstrap";

  if (dtoptions["searchPlaceholder"] != undefined && dtoptions["searchPlaceholder"] != "") {
    sPlaceholder = dtoptions["searchPlaceholder"];
  } else {
    sPlaceholder = "Filter records ...";
  }
  dtOptions["language"] = {
    search: "_INPUT_",
    searchPlaceholder: sPlaceholder
  };

  if (dtoptions.scroll == "Y") {
    dtOptions["scrollY"] = 200;
    dtOptions["scrollCollapse"] = true;
    dtOptions["paging"] = false;
  } else {
    dtOptions["pageLength"] = dtoptions.pagelength;
    /*
    dtOptions["dom"] =
      "<'dtable-heading' <'well1 cddatatable-topbox " +
      "row'<'col-md-6'f><'col-md-6'l>r>t<'row'<'col-md-3'i>" +
      "<'col-md-9 pager pager-lg1 text-right tablesorter-pager1'p> > >S";
*/
    dtOptions["dom"] =
      "<'dtable-heading' <'well1 cddatatable-topbox " +
      "row'<'col-md-9 search'f><'col-md-3 text-right'l>r>t<'row'<'col-md-3'i>" +
      "<'col-md-9 pager1 pager-lg1 text-right tablesorter-pager'p> > >S";
  }

  oTable = jQuery(divid).dataTable(dtOptions);
  //    jQuery(divid+'_wrapper').removeClass( 'form-inline' ).addClass( 'uf-datatables' );

  return oTable;
}

$.fn.dataTable.render.format_column = function (column_name) {
  return function (data, type, row) {
    //    var func = eval(column_name + 'GetFormatter');
    var func = column_name + 'GetFormatter';
    var colDiv = 'div[column_formatter="' + column_name + '"]';
    var colFormatter = column_name;
    var functionName = window[column_name + 'GetFormatter'];
    if (typeof functionName === 'function') {

      //    if ($.isFunction(functionName)) {
      //      newFormatter = this.$element.trigger(func, [row]);
      colFormatter = functionName(row);
      //      console.log('Line 135 : function ' + func + ' exists and newe formatter is ' + colFormatter);
    } else {
      //      console.log('Line 137 : function ' + func + ' does not exist');
    }
    if (
      type === "display" &&
      jQuery('div[column_formatter="' + colFormatter + '"]').length
    ) {
      var colhtml = jQuery(
        'div[column_formatter="' + colFormatter + '"]'
      ).html();
      jQuery.each(row, function (key, value) {
        //console.log("Line 92 replacing this "+'row.' + key);
        var rowkey = "row." + key;
        var rowkey1 = new RegExp(rowkey, "g");
        colhtml = colhtml.replace(rowkey1, value);
        //console.log("Line 95 the html is "+colhtml);
      });
      return colhtml;
    }
    // Search, order and type can use the original data
    return data;
  };
};

function showCRUDForm(oTableid, rowCrudDiv) {
  var tr = jQuery("#" + rowCrudDiv).closest("tr");

  var oTable = jQuery("#" + oTableid)
    .dataTable()
    .api();

  //  data = oTable.row($(this).parents("tr")).data();
  var row = oTable.row(tr);
  var data = row.data();
  var crudDivId = "crudform_" + oTableid;
  var crudhtml = "Edit Form not defined";
  if (jQuery("#" + crudDivId).length) {
    crudhtml = jQuery("#" + crudDivId).html();
    jQuery.each(data, function (key, value) {
      //console.log("Line 92 replacing this "+'row.' + key);
      var rowkey = "row." + key;
      var rowkey1 = new RegExp(rowkey, "g");
      crudhtml = crudhtml.replace(rowkey1, value);
      //console.log("Line 95 the html is "+colhtml);
    });
  }
  jQuery("#" + rowCrudDiv).html(crudhtml);
  //  return rowhtml;
}

function reloadDatatable(oTableid) {
  //    var oTable_full = [];
  //    var oTable_full = page_dttables[oTableid];
  //    var oTable = oTable_full['dtobject'];
  var oTable = jQuery("#" + oTableid).dataTable();
  oTable.fnReloadAjax();
}

function reloadDatatableNewURL(oTableid, dtURL) {
  //    var oTable_full = [];
  //    var oTable_full = page_dttables[oTableid];
  //    var oTable = oTable_full['dtobject'];
  var oTable = jQuery("#" + oTableid).dataTable();
  oTable.fnReloadAjax(dtURL, null, true);
}