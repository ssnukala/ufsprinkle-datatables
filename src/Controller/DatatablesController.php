<?php

/**
 * Datatables Sprinkle for UserFrosting
 *
 * @link      https://github.com/ufsprinkle-datatables
 * @copyright Copyright (c) 2013-2016 Srinivas Nukala
 *
 */

namespace UserFrosting\Sprinkle\Datatables\Controller;

use Psr\Container\ContainerInterface;
use UserFrosting\Sprinkle\Core\Controller\SimpleController;
use UserFrosting\Sprinkle\UfMessage\Controller\Util\UfMessageUtilController;
use UserFrosting\Support\Exception\NotFoundException;
use UserFrosting\Support\Repository\Loader\YamlFileLoader;

/**
 * DatatablesController Class
 *
 * Controller class for Datatables.  Handles datatable related activities
 *
 * @author Srinivas Nukala
 */
class DatatablesController extends SimpleController
{

    protected $destination;
    //    protected $schema;       // json schema for the datatable definitions
    protected $fields = []; // datatable field definitions
    protected $exportable = false; // fields that are exportable : false if none
    protected $options = []; // options for the data table
    protected $sprunje_name = 'sprunjenotset'; // Name if the sprunje
    protected $sprunje = 'sprunjenotset'; // Sprunje to be used for data retrieval
    protected $protected = true; //if the user needs to be logged in
    protected $permissions = []; // the permissions needed to access data, leave blank if open for all
    protected $schema = 'not_set';
    protected $CRUDctl;
    protected $default_options = [
        "htmlid" => "notsetbyuser",
        "ajax_url" => "/datatable/notsetbyuser",
        "pagelength" => 10,
        "extra_param" => "",
        "autoload" => true,
        "visible_columns" => 1,
        "initial_search" => "",
        "single_row" => "N",
        "export_cols" => false,
        "export_rows" => 'none',
        'rowId' => 'id',
        'ajax_params' => ['listable' => ['type' => 'hidden', 'name' => 'get_listable', 'value' => 'N']],
        'createdRow' => 'genericCreatedRow',
        //,"initial_sort" => [[0, 'asc']] // make first column is always ID even if is hidden?
    ];

    /**
     * Constructor.
     *
     * @param ContainerInterface $ci The global container object, which holds all your services.
     */
    public function __construct(ContainerInterface $ci)
    {
        $authenticator = $ci->authenticator;
        // Redirect if user is already logged in
        if (!$authenticator->check()) {
            $this->denyAccess();
            //throw new ForbiddenException();
        }
        $return = parent::__construct($ci);
        return $return;
    }

    public function isAdmin()
    {
        return $this->ci->currentUser->isMaster();
    }

    public function denyAccess($message = '')
    {
        //Debug::debug('Line 82 unauthorized access by: NotFoundException' . $this->ci->currentUser->user_name);
        throw new NotFoundException();
    }

    public function setCRUDController($dtprop = [])
    {
        if (isset($dtprop['crudctl'])) {
            $this->CRUDCtl = $dtprop['crudctl'];
        } else {
            $this->CRUDCtl = $this->getCRUDController();
        }
    }

    public function getCRUDController()
    {
        return 'SET-IN-CHILD';
    }

    public function setDestination($destination)
    {
        $this->destination = $destination;
    }

    public function getDestination()
    {
        return $this->destination;
    }

    public function setupDatatable($options = [])
    {
        //Debug::debug("Line 53 in Datatable Setup DDT class");
        $this->options = array_merge($this->default_options, $options);
        $this->setOption('export_cols', $this->exportable);
        $this->getColumnDefinitions();
        //logarr($cur_ff_table,"Line 34 dtdbcontroller params");
        $this->postDatatableInit();
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

    /*
    public function getProtected()
    {
    return $this->protected;
    }

    public function setProtected($protected)
    {
    $this->protected = $protected;
    }
     */

    public function verifyPermission()
    {
        // ToDO : Srinivas : 4/14 : need to think thru this and set the appropriate permissions
        // will comment this for now.
        // Can also handle this based on query also
        // The datatable query will restrict what the user can see based on role
        /*
    if (count($this->permissions) > 0) {
    $authorizer = $this->ci->authorizer;
    $currentUser = $this->ci->currentUser;
    foreach ($this->permissions as $permission) {
    if (!$authorizer->checkAccess($currentUser, $permission)) {
    Debug::debug("Line 119 throwing forbidden exception for - $permission");
    $this->denyAccess();
    }
    }
    }
     */
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
        $loader->addPath($this->schema);
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
        //Debug::debug("Line 188 options ", $this->options);
        $settings = $this->options;
        unset($settings['crud_forms']);
        unset($settings['formatters']);
        unset($settings['filters']);
        unset($settings['templates']);
        unset($settings['links']);

        $retarr = [];
        $retarr["settings"] = $settings;
        $retarr["fields"] = $this->fields;
        $retarr["formatters"] = isset($this->options['formatters']) ? $this->options['formatters'] : [];
        $retarr["filters"] = isset($this->options['filters']) ? $this->options['filters'] : [];
        $retarr["links"] = isset($this->options['links']) ? $this->options['links'] : [];
        $retarr["templates"] = isset($this->options['templates']) ? $this->options['templates'] : [];
        $retarr["crud_forms"] = isset($this->options['crud_forms']) ? $this->options['crud_forms'] : [];

        // Setting default for the Listable this can be overridden
        $listable = ['listable' => ['type' => 'hidden', 'name' => 'get_listable', 'value' => 'N']];
        $retarr['ajax_params'] = isset($this->options['ajax_params']) ? $this->options['ajax_params'] : $listable;

        return $retarr;
    }

    public function getDatatableComponent($request, $response, $args)
    {
        $this->setupDatatable();
        $dtarr = $this->getDatatableArray();

        /*        $template = 'pages/generic-crud.html.twig';
    return $this->ci->view->render($response, $template, [
    'info' => [
    'environment' => $this->ci->environment,
    'path' => ['project' => \UserFrosting\ROOT_DIR],
    ],
    'crudform' => $formArray,
    'params' => $params
    ]);
     */
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
        //Debug::debug("Line 208 The datatable params are ", $params);
        $var_sorts = [];
        if (isset($params1['order']) && is_array($params1['order'])) {
            foreach ($params1['order'] as $orderrec) {
                $thiscol = $params1['columns'][$orderrec['column']];
                $var_sorts[$thiscol['name']] = $orderrec['dir'];
            }
        }
        $params['sorts'] = $var_sorts;

        if (isset($args['filters'])) {
            if (isset($params['filters'])) {
                $params['filters'] = array_merge($params['filters'], $args['filters']);
            } else {
                $params['filters'] = $args['filters'];
            }
        }

        if (!isset($params['datatable'])) {
            $params['datatable'] = [];
        }
        if (!isset($params['datatable']['get_listable'])) {
            $params['datatable']['get_listable'] = 'Y';
        }
        //Debug::debug("Line 292 the datatable array is ", $params['datatable']);

        if (isset($params['format']) && $params['format'] == 'dtcsv') {
            $params['format'] = 'json';
            $args['format'] = 'dtcsv';
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
        if (isset($args['format'])) {
            $this->sprunje->setFormat($args['format']);
        }
        if ($this->exportable !== false) {
            $this->sprunje->setExportable($this->exportable);
        }
        $this->sprunje->setCurrentUser($this->ci->currentUser); // set the current user
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

    /**
     * extendSprunje function
     * Will be overridden in the child classes to extend the sprunje query
     *
     * @param [type] $request
     * @param [type] $response
     * @param [type] $args
     * @return void
     */
    public function confirmAccess($request, $response, $args)
    {
    }

    /**
     * addStatusFilter function
     * Child will use this to set filters
     *
     * @param [array] $dtprop
     * @return array
     */
    public function addFilter($dtprop, $options)
    {
        if (!is_array($options)) {
            $options = $dtprop['fields'][$options]['options'];
        }
        $filter2['options'] = $options['options'];
        $filter2['type'] = 'select';
        $filter2['id'] = 'sflt_' . $dtprop['htmlid'];
        $filter2['label'] = $options['label'];
        $filter2['name'] = $options['name'];
        $filter2['value'] = $options['value'];
        $filter2['data-source'] = $options['source'];
        $filter2['class'] = "form-control js-select2 input-sm";
        $dtprop['filters']['fields'][] = $filter2;
        return $dtprop;
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
        $this->verifyPermission();
        $this->setSprunje($request, $response, $args);
        // Extend query if needed in the child class
        $this->extendSprunje($request, $response, $args);
        return $this->toResponse($response);
    }

    public function toResponse($response)
    {
        if ($this->sprunje->getFormat() === 'dtcsv' && $this->sprunje->getExportable() === false) {
            $subject = 'CSV Download Error';
            $text = $this->ci->translator->translate(
                'DATATABLE.SPRUNJE.NO_EXPORTABLE_ADMIN',
                ['sprunje_name' => $this->sprunje_name, 'datatable' => get_class($this)]
            );
            $msgutil = new UfMessageUtilController($this->ci);
            $msgutil->sendAdminAlertMessage($subject, $text);
            // clear the alert stream with old alerts - for the most part this is invoked directly from a route
            $this->ci->alerts->resetMessageStream();
            $this->ci->alerts->addMessageTranslated('danger', 'DATATABLE.SPRUNJE.NO_EXPORTABLE');
            // don't set alert as the execption below will show the message already
            //$e = new BadRequestException('Exportable array is not defined in ' . $this->sprunje_name);
            //$e->addUserMessage('DATATABLE.SPRUNJE.NO_EXPORTABLE');
            //throw $e;
            return $response->withStatus(
                400,
                $this->ci->translator->translate('DATATABLE.SPRUNJE.NO_EXPORTABLE_ADMIN')
            );
        }
        return $this->sprunje->toResponse($response);
    }

    public function getLookup($request, $response, $args)
    {
        $params1 = $request->getParsedBody();
        $params = $request->getQueryParams();
        if (isset($params1['q'])) {
            $args['filters'] = ['lookup' => $params1['q']];
        }
        $offset = isset($params1['page']) ? ($params1['q'] * 10) : 0;

        //Debug::debug("Line 136 the lookup args are ", $args);
        //Debug::debug("Line 137 the post pody args are ", $params1);

        $this->setSprunje($request, $response, $args);
        $this->sprunje->setDestination('lookup');
        $this->sprunje->addFilterable('lookup');
        $this->extendSprunje($request, $response, $args);
        $this->sprunje->extendQuery(function ($query) use ($offset) {
            if ($offset > 0) {
                $query->offset($offset);
            }
            //Debug::debug("Line 150 args offset $offset - and args", $args);
            return $query;
        });
        //return $this->sprunje->toResponse($response);
        //Debug::debug("Line 361 getLookup getting array now");
        $result = $this->sprunje->getArray();
        //Debug::debug("Line 363 after GetArray");
        $result['pagination'] = ['more' => ($result['recordsFiltered'] > 10)];
        return $response->withJson($result, 200, JSON_PRETTY_PRINT);
    }
}