<?php
/**
 * UserFrosting (http://www.userfrosting.com)
 *
 * @link      https://github.com/ssnukala/uf-datatables
 * @license   https://github.com/userfrosting/UserFrosting/blob/master/licenses/UserFrosting.md (MIT License)
 */
namespace UserFrosting\Sprinkle\Datatables\Twig;

use Interop\Container\ContainerInterface;
use RocketTheme\Toolbox\ResourceLocator\UniformResourceLocator;
use UserFrosting\Sprinkle\Datatables\Controller\DatatablesController as DatatablesController;
use Slim\Http\Uri;

/**
 * Extends Twig functionality for the Account sprinkle.
 *
 * @author Alex Weissman (https://alexanderweissman.com)
 */
class DatatablesExtension extends \Twig_Extension implements \Twig_Extension_GlobalsInterface
{

    protected $services;
    protected $config;

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
                $dtcontroller = new DatatablesController($this->ci);
                $dtcontroller->setupDatatable($params);
                $dtarray = $dtcontroller->getDatatableArray();
                return $dtarray;
            })
        );
    }

}
