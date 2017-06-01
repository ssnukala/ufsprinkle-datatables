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
use UserFrosting\Sprinkle\AutoForms\Model\Formfields;
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
        $this->_source_type = 'FF';
        $cur_ff_table = $this->getColumnDefinitions();
//logarr($cur_ff_table,"Line 34 dtdbcontroller params");   
        $this->setDatatableParameters($cur_ff_table['fields']);
        $this->_db_columns = array_keys($this->_fields);
        $this->postDatatableInit();
    }
    
    protected function setDatatableParameters($par_tabdef=false) {
        $var_colspan = 0;
        $var_datatable_cols = $var_allcols = array();
        foreach ($par_tabdef as &$var_column) {
//logarr($var_column,"Line 980 tabdef");

            $var_colspan+=$var_column['visible'] == 'Y' ? 1 : 0;
            $var_column["padding"] = "";
            $var_column["name"] = $var_column['db_name'];
            $var_column["orderable"] = $var_column['orderable']=='Y';
//            $var_column["orderable"] = $this->_column_defaults['orderable'];
//            $var_column["searchable"] = $var_column['searchable'] == 'Y';
            $var_column["title"] = $var_column["label"];
            $var_column["type"] = $var_column['type'];
            $var_column["visible"] = $var_column['visible'] == 'Y';
            $var_column["class"] = "dt_column ".$var_column['db_name'];
            $var_column["width"] = "";
            $var_column["data"] = $var_column['db_name'];
            $var_column["render"] = "";

            $var_fcol = array();
            $var_fcol['db'] = $var_column['name'];
            $var_fcol['dt'] = $var_fcol['db'];
            
            if(isset($this->_formatters[$var_column['name']]))
            {
                $var_fcol['formatter']=$this->_formatters[$var_column['name']];
            }
            else
            {
                if ($var_column['type'] == 'date' || $var_column['type'] == 'datetime') {
                    $var_fcol['formatter'] = function( $d, $row ) {
                        if($d!='')
                            return date('D jS \of M Y h:i A', strtotime($d));
                        else
                            return $d;
                    };
                }
    //echobr($this->_dtjsvar." Line 181");
                if ($this->_show_detail == 'Y') {
                    if ($var_column['primary_key'] == 'Y') {
    //echobr("Line 69 ".$this->_ajax_detail);
                        $var_fcol['formatter'] = $this->setPrimaryKeyFormatter();
                    }
                }
            }
            $var_datatable_cols[] = $var_fcol;
            $var_allcols[$var_column['name']] = $var_column['label'];
        }
        $this->_fields = $par_tabdef;
        $this->_datatable['all_columns'] = $var_allcols;
        $this->_datatable['column_count'] = $var_colspan;
        $this->_datatable['column_data_def'] = $var_datatable_cols;
//logarr( $this->_datatable,"Line 91 datatable variable");        
    }
    
    protected function getColumnDefinitions()
    {

        $formfields = Formfields::getFieldDefinitions($this->_source);
//SnUtil::logarr($formfields,"Line 102  column definitions for ".$this->_source." and table ".$this->_db_table);        

        return $formfields;
    }
    

}
