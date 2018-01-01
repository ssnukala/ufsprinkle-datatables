<?php

/**
 * Chinmaya Registration Sevak (http://www.chinmayacloud.com)
 *
 * @link      https://github.com/chinmaya.regsevak
 * @copyright Copyright (c) 2013-2016 Srinivas Nukala
 * @license   https://github.com/chinmaya.regsevak/blob/master/licenses/UserFrosting.md (MIT License)
 */

namespace UserFrosting\Sprinkle\Datatables\Controller;

use Carbon\Carbon;
use UserFrosting\Sprinkle\Core\Controller\SimpleController;
use UserFrosting\Support\Exception\BadRequestException;
use UserFrosting\Support\Exception\ForbiddenException;
use UserFrosting\Sprinkle\Core\Util\EnvironmentInfo;
use UserFrosting\Fortress\RequestDataTransformer;
use UserFrosting\Fortress\RequestSchema;
use UserFrosting\Fortress\ServerSideValidator;
//use UserFrosting\Sprinkle\Datatables\Database\Models\DatatableSource;
use UserFrosting\Sprinkle\SnUtilities\Controller\SnUtilities as SnUtil;
use UserFrosting\Support\Repository\Loader\YamlFileLoader;
use UserFrosting\Sprinkle\Core\Facades\Debug;

/**
 * AdminController Class
 *
 * Controller class for /admin URL.  Handles admin-related activities
 *
 * @author Alex Weissman
 * @link http://www.userfrosting.com/navigating/#structure
 */
class DatatablesController extends SimpleController {
    protected $schema;       // json schema for the datatable definitions

    protected $_htmlid;       // table that this datatable will use to query
    protected $_fields;       // source fields data model
    protected $_datatable;
    protected $_formatters = [];
//    protected $_db_columns;       // columns that this datatable will use to query
    protected $_role = 'guest';
    protected $_protected=true; //if the user needs to be logged in

    public function setupDatatable($properties = []) {
//SnUtil::logarr($properties,"Line 56 Datatables controller");
        $this->_htmlid = SnUtil::valueIfSet($properties, 'htmlid', $this->_htmlid);
        $this->_role = SnUtil::valueIfSet($properties, 'role', $this->_role);
        $this->setFormatters();
    }

    public function getFieldAttributes($field) {
        if (isset($this->_fields[$field])) {
            return $this->_fields[$field];
        } else {
            return false;
        }
    }

    public function setFieldAttribute($field, $attribute, $value) {
        if (!isset($this->_fields[$field])) {
            $this->_fields[$field] = [];
        }
        $this->_fields[$field][$attribute] = $value;
    }

    public function getFieldAttribute($field, $attribute) {
        if (!isset($this->_fields[$field][$attribute])) {
            return $this->_fields[$field][$attribute];
        } else {
            return false;
        }
    }

    public function setRole($role) {
//error_log("Line 55 setting user role to $role");
        $this->_role = $role;
        // will be used by the child classes to set the formatters for various columns
    }

    public function getRole() {
        return $this->_role;
        // will be used by the child classes to set the formatters for various columns
    }

    public function setProtected($protected) {
//error_log("Line 55 setting user role to $role");
        $this->_protected = $protected;
        // will be used by the child classes to set the formatters for various columns
    }

    public function getProtected() {
        return $this->_protected;
        // will be used by the child classes to set the formatters for various columns
    }

    protected function getSchemaContent()
    {
        // Define the YAML loader
        $loader = new YamlFileLoader([]);
        $loader->addPath($this->schema);
        return $loader->load();
    }
        
    public function getDatatableOptions() {
        return $this->_datatable['options'];
    }

    public function setDatatableOption($option, $optvalue) {
        $this->_datatable['options'][$option] = $optvalue;
    }

    public function postDatatableInit() {
        $this->setDatatableDefaultOptions();
    }

    public function setFormatters() {
        // will be used by the child classes to set the formatters for various columns
    }

    protected function getColumnDefinitions() {
        // will be used by the child classes to set the formatters for various columns
        return $this->getSchemaContent($this);

    }

    public function getDatatableArray() {
        $this->_datatable['htmlid'] = $this->_htmlid;
        $this->_datatable['fields'] = $this->_fields;
//        $this->_datatable['fields'] = [];
//        $var_dtfields =["name","title","type","data","default","orderable","searchable","visible","class","padding","width"];
//        foreach($this->_fields as $fldid => $field)
//        {
//            foreach($var_dtfields as $dtfield)
//            {
//                $this->_datatable['fields'][$fldid][$dtfield]=$field[$dtfield];
//            }
//        }
//Debug::debug("Line 155 fields ", $this->_datatable['fields']);        
        return $this->_datatable;
    }

    private function setDatatableDefaultOptions() {
        if(!isset($this->_datatable['options']['pagelength']))
        {
            $this->_datatable['options']['pagelength']=10;
        }
        $this->_datatable['options'] = array(
            "htmlid" => $this->_htmlid,
            "pagelength" => $this->_datatable['options']['pagelength'],
            "extra_param" => "",
            "swf_path" => "/swf",
            "initial_search" => ""
                );
//logarr($this->_datatable['options'],"Line 186");        
    }

    protected function setDatatableParameters($par_tabdef = false) {
        $var_colspan = 0;
        $var_datatable_cols = $var_allcols = array();
        if ($par_tabdef === false) {
            $par_tabdef = $this->_fields;
        }
///logarr($par_tabdef,"Line 279 fields");        
        foreach ($par_tabdef as &$var_column) {
//            logarr($var_column, "Line 980 tabdef");
            $var_colspan += $var_column['visible'] ? 0 : 1;
            $var_fcol = array();
            $var_fcol['db'] = $var_column['name'];
            $var_fcol['dt'] = $var_fcol['db'];
            $var_column["data"] = $var_column['name'];

            if (isset($this->_formatters[$var_column['name']])) {
                $var_fcol['formatter'] = $this->_formatters[$var_column['name']];
            } 
//            else {
//                if ($var_column['type'] == 'date' || $var_column['type'] == 'datetime') {
//                    $var_fcol['formatter'] = function( $d, $row ) {
//                        if ($d != '')
//                            return date('D jS \of M Y h:i A', strtotime($d));
//                        else
//                            return $d;
//                    };
//                }
//                //echobr($this->_dtjsvar." Line 181");
//                if ($this->_show_detail == 'Y') {
//                    if (isset($var_column['primary_key']) && $var_column['primary_key']) {
//                        //echobr("Line 69 ".$this->_ajax_detail);
//                        $var_fcol['formatter'] = $this->setPrimaryKeyFormatter();
//                    }
//                }
//            }
            $var_datatable_cols[] = $var_fcol;
            $var_allcols[$var_column['name']] = $var_column['name'];
        }
        $this->_fields = $par_tabdef;
    }

    /**
     * Create the data output array for the DataTables rows
     *
     *  @param  array $columns Column information array
     *  @param  array $data    Data from the SQL get
     *  @return array          Formatted data in a row based format
     */

// Deleted functions
/*
    public function createDatatableHTMLJS() {
        $this->createDatatableHTML();
        $this->createDatatableJS();
    }

    public function createDatatableHTML() {
//logarr($this->_datatable,"Line 168 datatable array");        
        $var_dtinfo = array();
        $var_dtinfo['htmlid'] = $this->_htmlid;
        $var_dtinfo['colspan'] = $this->_datatable['column_count'];
//logarr($var_dtinfo,"Line 109 datatable html render");        
        $this->_datatable['html'] = $this->ci->view->fetch($this->_datatable_html_twig, [
            'dtinfo' => $var_dtinfo
        ]);
    }

    public function createDatatableJS() {
//SnUtil::logarr($this->_datatable['options'],"Line 123 datatable options and the JS file is ".$this->_datatable_js_twig);    
//error_log("Line 163 datatable options and the JS file is ".$this->_datatable_js_twig);    
        $this->_datatable['js'] = $this->ci->view->fetch($this->_datatable_js_twig, [
            'dtoptions' => $this->_datatable['options'],
            'fields'=>$this->_fields]
        );
//error_log("Line 175 the js file contents are ".$this->_datatable['js']);        
    }

    public function initializeFieldAttributes($field, $title = '', $visible = false, $primary_key = 'N') {
        if ($title == '') {
            $title = ucwords(str_replace('_', ' ', $field));
        }
        $this->_fields[$field] = ["primary_key" => $primary_key, "name" => $field, "orderable" => $this->_sortable,
            "searchable" => $this->_searchable, "title" => $title, "type" => "text", "visible" => $visible,
            "showin_editform" => true];
    }

    public function getWhereCriteria() {
        return $this->_where_criteria;
    }

    public function setWhereCriteria($where) {
        $this->_where_criteria = $where;
    }

    public function getOrderBy() {
        return $this->_order_by;
    }

    public function setOrderBy($order) {
        $this->_order_by = $order;
    }

    public function setPrimaryKeyFormatter() {
        if ($this->_ajax_detail == 'N') {
            $var_pkformatter = function( $d, $row ) {
                $var_ret = "<a class='edit_row' onClick='onClickEditRow(\"$this->_htmlid\",this);return false;'>ID-$d</a>";
                return $var_ret;
            };
        } else {
            $var_pkformatter = function( $d, $row ) {
                $var_ret = "<a class='edit_row' onClick='onClickAjaxEditRow(\"$this->_htmlid\",this,$d);return false;'>Ajax ID-$d</a>";
                return $var_ret;
            };
        }
        return $var_pkformatter;
    }

    public function getDataFromSource($getparam, $par_nondbcols = 'none', $par_where = '', $par_filter = '', $par_order = '') {

        DatatableSource::init($this->_db_table);

//logarr($getparam,"Line 112 inside DB Datatable controller, $par_nondbcols = 'none', $par_where = '', $par_filter = '' Table ".$this->_db_table);            
//logarr($this->_db_columns,"Line 113 columns");
//logarr($this->_datatable['column_data_def'],"Line 115 column def");
//            $var_retarr = $this->simple($getparam, $par_nondbcols, $par_where, $par_filter);
//error_log("Line 143 setting dtrowid ".$this->_datatable['options']['_dt_rowid']) ;           
        DatatableSource::setRowIdColumn($this->_datatable['options']['_dt_rowid']);
        $var_retdata = DatatableSource::getDatatableData($this->_datatable['column_data_def'], $getparam, $par_nondbcols, $par_where, $par_filter, $par_order);

        $this->_data['records'] = $var_retdata['records'];
        $this->_data['filtered_count'] = $var_retdata['filtered_count'];
        $this->_data['total_count'] = $var_retdata['total_count'];

        return $var_retdata;
    }

    public function populateDatatable($request, $response, $args) {
        $data = $this->getDatatablePost($request);
//SnUtil::logarr($data,"Line 340 populate datatable input is"); 

        $this->getDataFromSource($data);

//SnUtil::echobr($data,"Line 340 populate datatable input is"); 
        $var_retarr = $this->createOutputJSONArray($data['draw']);

// @var Config $config 
        $config = $this->ci->config;

//        return $response->withJson($var_retarr, 200, JSON_PRETTY_PRINT);
        return $response->write(json_encode($var_retarr));
    }

    public function getDatatablePost($request) {
        // Get POST parameters: name, slug, icon, description
        $params = $request->getParsedBody();

// @var UserFrosting\Sprinkle\Account\Authorize\AuthorizationManager 
        $authorizer = $this->ci->authorizer;

// @var UserFrosting\Sprinkle\Account\Database\Models\User $currentUser 
        $currentUser = $this->ci->currentUser;

        if ($this->_protected) {
            // Access-controlled page
            if (!$authorizer->checkAccess($currentUser, 'datatable_data')) {
                throw new ForbiddenException();
            }
        }

// @var MessageStream $ms 
        $ms = $this->ci->alerts;

        // Load the request schema
        $schema = new RequestSchema('schema://datatable.json');

        // Whitelist and set parameter defaults
        $transformer = new RequestDataTransformer($schema);
        $data = $transformer->transform($params);

        $error = false;

        // Validate request data
        $validator = new ServerSideValidator($schema, $this->ci->translator);
        if (!$validator->validate($data)) {
            $ms->addValidationErrors($validator);
            $error = true;
        }

        if ($error) {
            return $response->withStatus(400);
        }
        return $data;
    }

    public function createOutputJSONArray($par_draw) {

//count($this->_db_table), count($this->_db_table), $var_cols, $this->_db_table        
//echoarr($par_datacols,"Line 299 data cols ");            
//echoarr($par_data,"Line 300 data  ");            
        $this->createDatatableOutput();
        $var_retarr = array(
            "draw" => intval($par_draw),
            "recordsTotal" => intval($this->_data['total_count']),
            "recordsFiltered" => intval($this->_data['filtered_count']),
            "aaData" => $this->_datatable['output_data']
        );
        return $var_retarr;
    }

    public function createDatatableOutput() {
//    data_output($data) {
//echoarr($data, "Line 36 data array") ;           
//echoarr($columns, "Line 36 column array") ;           
        $out = array();

// fot future use : if we add custom columns that are not in the database        
//        if ($var_datacols != '') {
//            $var_datacols = array_merge($this->_datatable['column_data_def'], $var_datacols);
//        } else
//            $var_datacols = $this->_datatable['column_data_def'];
//echoarr($var_datacols,"Line 291 ");                

        foreach ($this->_data['records'] as $var_datarec) {
///echoarr($var_datarec);            
            $row = array();
//logarr($this->_datatable['column_data_def'],"Line 332 the coldef array");            
            foreach ($this->_datatable['column_data_def'] as $var_coldef) {
//SnUtil::logarr($var_coldef,"Line 390");  
                $thisdbfield = $var_coldef['db'];
                if (isset($var_coldef['formatter'])) {
//                                    echobr("Line 46 formatter is set");
//SnUtil::logarr($var_coldef['dt'],"Line 393");    
//SnUtil::logarr($var_coldef['db'],"Line 393");    

                    $row[$var_coldef['dt']] = $var_coldef['formatter']($var_datarec->$thisdbfield, $var_datarec);
                } else {
                    $row[$var_coldef['dt']] = $var_datarec->$thisdbfield;
                }
            }

            $out[] = $row;
        }
        $this->_datatable['output_data'] = $out;
    }

*/    
    
}
