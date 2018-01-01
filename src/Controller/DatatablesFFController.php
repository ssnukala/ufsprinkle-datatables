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
use UserFrosting\Sprinkle\Datatables\Controller\DatatablesController;
use UserFrosting\Support\Exception\BadRequestException;
use UserFrosting\Support\Exception\ForbiddenException;
use UserFrosting\Sprinkle\Core\Util\EnvironmentInfo;
use UserFrosting\Fortress\RequestDataTransformer;
use UserFrosting\Fortress\RequestSchema;
use UserFrosting\Sprinkle\AutoForms\Database\Models\Formfields;
use UserFrosting\Sprinkle\SnUtilities\Controller\SnUtilities as SnUtil;

/**
 * AdminController Class
 *
 * Controller class for /admin URL.  Handles admin-related activities
 *
 * @author Alex Weissman
 * @link http://www.userfrosting.com/navigating/#structure
 */
class DatatablesFFController extends DatatablesController {

    public function setupDatatable($properties = []) {
//SnUtil::logarr($properties,"Line 30 FF controller");
        
        parent::setupDatatable($properties);
        $cur_ff_table = $this->getColumnDefinitions();
//logarr($cur_ff_table,"Line 34 dtdbcontroller params");   
        $this->setDatatableParameters($cur_ff_table['fields']);
//        $this->_db_columns = array_keys($this->_fields);
        $this->postDatatableInit();
    }
    
    protected function setDatatableParameters($par_tabdef=false) {
        $var_colspan = 0;
        $var_datatable_cols = $var_allcols = array();
        foreach ($par_tabdef as &$var_column) {
//logarr($var_column,"Line 980 tabdef");

            $var_colspan+=$var_column['visible'] ? 1 : 0;
            $var_fcol = array();
            $var_fcol['db'] = $var_column['name'];
            $var_fcol['dt'] = $var_fcol['db'];
            
            if(isset($this->_formatters[$var_column['name']]))
            {
                $var_fcol['formatter']=$this->_formatters[$var_column['name']];
            }
            $var_datatable_cols[] = $var_fcol;
            $var_allcols[$var_column['name']] = $var_column['label'];
        }
        $this->_fields = $par_tabdef;
    }
    
    protected function getColumnDefinitions()
    {

        $formfields = Formfields::getFieldDefinitions($this->_source);

        return $formfields;
    }
    

}
