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
  var pLength;
  var dtSettings = {
    //https://datatables.net/forums/discussion/46752/the-column-render-callback-runs-too-many-times
    autoWidth: false,
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
    },
    customRenderCallback: dtoptions.customRenderCallback,
  };
  if (dtoptions["select"] != undefined && dtoptions["select"] != "") {
    dtoptions["select"] = {
      style: 'single'
    };
  }

  dtSettings["sWrapper"] = "dataTables_wrapper uf-datatable dt-bootstrap";

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
    /*
    dtSettings["dom"] =
      "<'dtable-heading' <'well1 cddatatable-topbox " +
      "row'<'col-md-6'f><'col-md-6'l>r>t<'row'<'col-md-3'i>" +
      "<'col-md-9 pager pager-lg1 text-right tablesorter-pager1'p> > >S";
*/
    dtSettings["dom"] =
      "<'dtable-heading' <'well1 cddatatable-topbox " +
      "row'<'col-md-8 search'f><'col-md-4 text-right'l>>rt<'row'<'col-md-3'i>" +
      "<'col-md-9 pager1 pager-lg1 text-right tablesorter-pager'p> > >S";
  }

  if (dtoptions["formatCallback"] != undefined && dtoptions["formatCallback"] != "") {
    dtSettings["formatCallback"] = dtoptions["formatCallback"];
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

  oTable = jQuery(divid).dataTable(dtSettings);
  //    jQuery(divid+'_wrapper').removeClass( 'form-inline' ).addClass( 'uf-datatables' );

  return oTable;
}

$.fn.dataTable.render.format_column = function (column_name) {
  return function (data, type, row, meta) {
    //    var func = eval(column_name + 'GetFormatter');
    //console.log("Line 122 Datatable Util" + meta.settings.sTableId);
    /*  
// old code that looks for javascript formatter function : June 2019 this is not in use at this time      
        var func = column_name + "GetFormatter";
        var colFormatter = column_name;
        var functionName = window[column_name + func];
        if (typeof functionName === "function") {
          //    if ($.isFunction(functionName)) {
          //      newFormatter = this.$element.trigger(func, [row]);
          colFormatter = functionName(row);
          //      console.log('Line 135 : function ' + func + ' exists and newe formatter is ' + colFormatter);
        }
    */

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
        var colhtml = fillFieldTags(colhtml, row);
        jQuery.each(row, function (key, value) {
          //console.log("Line 92 replacing this "+'row.' + key);
          var rowkey = "row." + key;
          var rowkey1 = new RegExp(rowkey, "g");
          colhtml = colhtml.replace(rowkey1, value);
          //console.log("Line 95 the html is "+colhtml);
        });
        return colhtml;
      }
    }
    // Search, order and type can use the original data
    return data;
  };
};

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

function genericPreDrawFilter(settings) {
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
        jQuery(this).val(value);
      });
    });

  }
  return returnval;
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