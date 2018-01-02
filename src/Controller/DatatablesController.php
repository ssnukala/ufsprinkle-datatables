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
    protected $fields=[];       // datatable field definitions
    protected $options=[];       // options for the data table
    protected $sprunje_name='sprunjenotset';       // Name if the sprunje
    protected $sprunje='sprunjenotset';       // Sprunje to be used for data retrieval
    protected $protected = true; //if the user needs to be logged in
    protected $default_options= [
            "htmlid"=>"notsetbyuser",
            "ajax_url"=>"/datatable/notsetbyuser",
            "pagelength" => 10,
            "extra_param" => "",
            "swf_path" => "/swf",
            "visible_columns"=>1,
            "initial_search" => ""
        ];


    public function setupDatatable($options = []) {
        $this->options = array_merge($this->default_options,$options);
        $this->setFormatters();
        $this->getColumnDefinitions();
//logarr($cur_ff_table,"Line 34 dtdbcontroller params");   
        $this->postDatatableInit();
    }

    public function getField($field) {
        if (isset($this->fields[$field])) {
            return $this->fields[$field];
        } else {
            return false;
        }
    }

    public function setField($field,$fieldrec) {
            $this->fields[$field]=$fieldrec;
    }
    
    public function setFieldAttribute($field, $attribute, $value) {
        if (!isset($this->fields[$field])) {
            $this->fields[$field] = [];
        }
        $this->fields[$field][$attribute] = $value;
    }

    public function getFieldAttribute($field, $attribute) {
        if (!isset($this->fields[$field][$attribute])) {
            return $this->fields[$field][$attribute];
        } else {
            return false;
        }
    }

    public function getProtected() {
        return $this->protected;
    }

    public function setProtected($protected) {
        $this->protected = $protected;
    }

    public function getSprunjeName() {
        return $this->sprunje_name;
    }

    public function setSprunjeName($sprunje_name) {
        $this->sprunje_name = $sprunje_name;
    }

    public function getOptions() {
        return $this->options;
    }

    public function setOptions($options) {
        $this->options = $options;
    }

    public function getOption($option) {
        if (!isset($this->options[$option])) {
            return $this->options[$option];
        } else {
            return false;
        }
    }

    public function setOption($option, $optvalue) {
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
        $this->options['visible_columns']=$var_colspan;
    }

    public function getDatatableArray() {
//Debug::debug("Line 155 fields ", $this->fields);        
        $var_retarr = [
            "fields"=>$this->fields,
            "options"=>$this->options
        ];
        return $var_retarr;
    }

    /**
     * Returns a list of DSD Tracking report
     *
     * Generates a list of users, optionally paginated, sorted and/or filtered.
     * This page requires authentication.
     * Request type: GET
     */
    public function setSprunje($request, $response, $args) {
// POST Parameters        
        $params1 = $request->getParsedBody();
        // GET parameters
        $params = $request->getQueryParams();
        if (!is_null($params1)) {
            $params = array_merge($params, $params1);
        }
Debug::debug("Line 188 Sprunje name is ".$this->sprunje_name);

        /** @var UserFrosting\Sprinkle\Account\Authorize\AuthorizationManager $authorizer */
        $authorizer = $this->ci->authorizer;

        /** @var UserFrosting\Sprinkle\Account\Database\Models\User $currentUser */
        $currentUser = $this->ci->currentUser;

        // Access-controlled page
//        if (!$authorizer->checkAccess($currentUser, 'uri_users')) {
//            throw new ForbiddenException();
//        }

        /** @var UserFrosting\Sprinkle\Core\Util\ClassMapper $classMapper */
        $classMapper = $this->ci->classMapper;

        $this->sprunje = $classMapper->createInstance($this->sprunje_name, $classMapper, $params);
    }

}
