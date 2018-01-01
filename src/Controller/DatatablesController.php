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

//    protected $schema;       // json schema for the datatable definitions
    protected $fields;       // datatable field definitions
    protected $options;       // options for the data table
    protected $protected = true; //if the user needs to be logged in

    public function setupDatatable($options = []) {
        $default_options = array(
            "htmlid"=>"notsetbyuser",
            "ajax_url"=>"/datatable/notsetbyuser",
            "pagelength" => 10,
            "extra_param" => "",
            "swf_path" => "/swf",
            "initial_search" => ""
        );
        $this->options = array_merge($default_options,$options);
        $this->setFormatters();
        $this->getColumnDefinitions();
//logarr($cur_ff_table,"Line 34 dtdbcontroller params");   
        $this->postDatatableInit();
    }

    public function getFieldAttributes($field) {
        if (isset($this->fields[$field])) {
            return $this->fields[$field];
        } else {
            return false;
        }
    }

    public function setFieldAttribute($field, $attribute, $value) {
        if (!isset($this->fields[$field])) {
            $this->fields[$field] = [];
        }
        $this->fields[$field][$attribute] = $value;
    }

    public function getFieldAttribute($field, $attribute) {
        if (!isset($this->fields[$attribute])) {
            return $this->fields[$attribute];
        } else {
            return false;
        }
    }

    public function setProtected($protected) {
        $this->protected = $protected;
        // will be used by the child classes to set the formatters for various columns
    }

    public function getProtected() {
        return $this->protected;
        // will be used by the child classes to set the formatters for various columns
    }

    public function getDatatableOptions() {
        return $this->options;
    }

    public function setDatatableOption($option, $optvalue) {
        $this->options[$option] = $optvalue;
    }

    public function postDatatableInit() {
        // will be used by the child classes to set additional options
    }

    public function setFormatters() {
        // will be used by the child classes to set the formatters for various columns
    }

    protected function getSchemaContent() {
        // Define the YAML loader
        $loader = new YamlFileLoader([]);
        $loader->addPath($this->options['schema']);
        return $loader->load();
    }

    protected function getColumnDefinitions() {
//        $cur_ff_table = parent::getColumnDefinitions();
//Debug::debug("Line 39 column definitions",$cur_ff_table);        
        $jsonschema = $this->getSchemaContent();
        $this->fields = $jsonschema;
        $this->setColumnDefaults();
        // will be used by the child classes to set the formatters for various columns
    }

    public function getDatatableArray() {
//        $this->fields = $this->fields;
//Debug::debug("Line 155 fields ", $this->fields);        
        $var_retarr = [
            "fields"=>$this->fields,
            "options"=>$this->options,
            "formatters"=>[],
            "filters"=>[]
        ];
        
        return $var_retarr;
    }

    protected function setColumnDefaults($par_tabdef = false) {
        if ($par_tabdef === false) {
            $par_tabdef = $this->fields;
        }
        $var_colspan = 0;
        foreach ($par_tabdef as &$var_column) {
            if ($var_column['visible']) {
                $var_colspan++;
            }
            if (!isset($var_column["data"])) {
                $var_column["data"] = $var_column['name'];
            }
            $var_column["class"] = (isset($var_column["class"]) ? $var_column["class"] : "") . " dt_column " . $var_column['name'];
        }
        $this->fields = $par_tabdef;
    }

}
