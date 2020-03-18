<?php

/**
 * UserFrosting (http://www.userfrosting.com)
 *
 * @link      https://github.com/ssnukala/uf-datatables
 * @license   https://github.com/userfrosting/UserFrosting/blob/master/licenses/UserFrosting.md (MIT License)
 */

namespace UserFrosting\Sprinkle\Datatables\Twig;

use Interop\Container\ContainerInterface;
use UserFrosting\Support\Repository\Repository as Config;
use UserFrosting\Sprinkle\Datatables\Controller\DatatablesController as DatatablesController;

/**
 * Extends Twig functionality for the Datatable sprinkle.
 *
 * @author Srinivas Nukala
 */
class DatatablesExtension extends \Twig_Extension implements \Twig_Extension_GlobalsInterface
{
    /**
     * @var ContainerInterface
     */
    protected $services;

    /**
     * @var Config
     */
    protected $config;


    /**
     * @param ContainerInterface $services
     */
    public function __construct(ContainerInterface $services)
    {
        $this->services = $services;
        $this->config = $services->config;
    }

    public function getName()
    {
        return 'userfrosting/datatables';
    }

    public function getFunctions()
    {
        return array(
            // Add Twig function for checking permissions during dynamic menu rendering
            new \Twig_SimpleFunction('createDatatable', function ($params = []) {
                //Srinivas TODO : This is not working, CI is not valide here, need to understand how to invoke controller classes here                
                $dtcontroller = new DatatablesController($this->services);
                $dtcontroller->setupDatatable($params);
                $dtarray = $dtcontroller->getDatatableArray();
                return $dtarray;
            }),
            new \Twig_SimpleFunction('unsetKey', function ($inputarr, $key) {
                unset($inputarr[$key]);
                return $inputarr;
            })
        );
    }

    public function getGlobals()
    {
        return ['twig_ext' => 'datatable'];
    }
}
