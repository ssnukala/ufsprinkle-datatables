<?php

/**
 * Datatables Sprinkle for UserFrosting
 *
 * @link      https://github.com/ufsprinkle-datatables
 * @copyright Copyright (c) 2013-2016 Srinivas Nukala
 *
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
 * DatatablesController Class
 *
 * Controller class for Datatables.  Handles datatable related activities
 *
 * @author Srinivas Nukala
 */
class DatatablesController extends SimpleController
{

    //    protected $schema;       // json schema for the datatable definitions
    protected $fields = [];       // datatable field definitions
    protected $options = [];       // options for the data table
    protected $sprunje_name = 'sprunjenotset';       // Name if the sprunje
    protected $sprunje = 'sprunjenotset';       // Sprunje to be used for data retrieval
    protected $protected = true; //if the user needs to be logged in
    protected $default_options = [
        "htmlid" => "notsetbyuser",
        "ajax_url" => "/datatable/notsetbyuser",
        "pagelength" => 10,
        "extra_param" => "",
        "visible_columns" => 1,
        "initial_search" => "",
        "single_row" => "N"
        //,"initial_sort" => [[0, 'asc']] // make first column is always ID even if is hidden?
    ];


    public function setupDatatable($options = [])
    {
        //Debug::debug("Line 53 in Datatable Setup DDT class");
        $this->options = array_merge($this->default_options, $options);
        $this->getColumnDefinitions();
        //logarr($cur_ff_table,"Line 34 dtdbcontroller params");
        $this->postDatatableInit();
    }

    /**
     * getList function
     * Returns the json array to populate the datatable, 
     * almost 100% of the time this will be overridden in the child class 
     * @param [type] $request
     * @param [type] $response
     * @param [type] $args
     * @return JSON object to pouplate the datatable
     */
    public function getList($request, $response, $args)
    {
        $this->setSprunje($request, $response, $args);
        // Extend query if needed in the child class
        $this->extendSprunje($request, $response, $args);

        if ($args['format'] === 'json') {
            return $this->sprunje->toResponse($response);
        }
    }

    public function getField($field)
    {
        if (isset($this->fields[$field])) {
            return $this->fields[$field];
        } else {
            return false;
        }
    }

    public function setField($field, $fieldrec)
    {
        $this->fields[$field] = $fieldrec;
    }

    public function setFieldAttribute($field, $attribute, $value)
    {
        if (!isset($this->fields[$field])) {
            $this->fields[$field] = [];
        }
        $this->fields[$field][$attribute] = $value;
    }

    public function getFieldAttribute($field, $attribute)
    {
        if (!isset($this->fields[$field][$attribute])) {
            return $this->fields[$field][$attribute];
        } else {
            return false;
        }
    }

    public function getProtected()
    {
        return $this->protected;
    }

    public function setProtected($protected)
    {
        $this->protected = $protected;
    }

    public function getSprunjeName()
    {
        return $this->sprunje_name;
    }

    public function setSprunjeName($sprunje_name)
    {
        $this->sprunje_name = $sprunje_name;
    }

    public function getOptions()
    {
        return $this->options;
    }

    public function setOptions($options)
    {
        foreach ($options as $key => $value) {
            $this->options[$key] = $value;
        }
    }

    public function getOption($option)
    {
        if (!isset($this->options[$option])) {
            return $this->options[$option];
        } else {
            return false;
        }
    }

    public function setOption($option, $optvalue)
    {
        $this->options[$option] = $optvalue;
    }

    public function postDatatableInit()
    {
        // will be used by the child classes to set additional options
    }

    protected function getSchemaContent()
    {
        // Define the YAML loader
        $loader = new YamlFileLoader([]);
        $loader->addPath($this->options['schema']);
        return $loader->load();
    }

    protected function getColumnDefinitions()
    {
        //        $cur_ff_table = parent::getColumnDefinitions();
        //Debug::debug("Line 39 column definitions",$cur_ff_table);
        $jsonschema = $this->getSchemaContent();
        $this->fields = $jsonschema;
        $this->setColumnDefaults();
    }

    protected function setColumnDefaults($par_tabdef = false)
    {
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
        $this->options['visible_columns'] = $var_colspan;
    }

    public function getDatatableArray()
    {
        //        Debug::debug("Line 155 fields ", $this->fields);
        $var_retarr = [
            "fields" => $this->fields,
            "options" => $this->options
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
    public function setSprunje($request, $response, $args)
    {
        // POST Parameters
        $params1 = $request->getParsedBody();
        // GET parameters
        $params = $request->getQueryParams();
        if (!is_null($params1)) {
            $params = array_merge($params, $params1);
        }
        //        Debug::debug("Line 208 The datatable params are ", $params);
        $var_sorts = [];
        foreach ($params1['order'] as $orderrec) {
            $thiscol = $params1['columns'][$orderrec['column']];
            $var_sorts[$thiscol['name']] = $orderrec['dir'];
        }
        $params['sorts'] = $var_sorts;

        if (isset($args['filters'])) {
            if (isset($params['filters'])) {
                $params['filters'] = array_merge($params['filters'], $args['filters']);
            } else {
                $params['filters'] = $args['filters'];
            }
        }
        if (isset($args['format'])) {
            $params['format'] = $args['format'];
        }
        //Debug::debug("Line 214 sending sorts to create sprunje",$var_sorts);
        //Debug::debug("Line 188 Sprunje name is ".$this->sprunje_name);
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
        //Debug::debug("Line 234 setting sprunje " . $this->sprunje_name, $params);
        $this->sprunje = $classMapper->createInstance($this->sprunje_name, $classMapper, $params);
    }

    /**
     * extendSprunje function
     * Will be overridden in the child classes to extend the sprunje query
     *
     * @param [type] $request
     * @param [type] $response
     * @param [type] $args
     * @return void
     */
    public function extendSprunje($request, $response, $args)
    {
    }
}
