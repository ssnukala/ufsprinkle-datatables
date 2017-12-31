<?php
/**
 * UserFrosting (http://www.userfrosting.com)
 *
 * @link      https://github.com/userfrosting/UserFrosting
 * @license   https://github.com/userfrosting/UserFrosting/blob/master/licenses/UserFrosting.md (MIT License)
 */
namespace UserFrosting\Sprinkle\Datatables\Sprunje;

use Illuminate\Database\Capsule\Manager as Capsule;
use UserFrosting\Sprinkle\Core\Facades\Debug;
use UserFrosting\Sprinkle\Core\Sprunje\Sprunje;

/**
 * ActivitySprunje
 *
 * Implements Sprunje for the Datatables API.
 *
 * @author Srinivas Nukala (https://srinivasnukala.com)
 */
class DatatablesSprunje extends Sprunje
{
    /**
     * Default HTTP request parameters
     *
     * @var array[string]
     */
//    protected $options1 = [
//        'draw' => null,
//        'sorts' => [],
//        'order' => [],
//        'filters' => [],
//        'search' => [],
//        'lists' => [],
//        'size' => 'all',
//        'length' => 'all',
//        'page' => null,
//        'start' => null,
//        'format' => 'json'
//    ];

    /**
     * Array key for the total unfiltered object count.
     *
     * @var string
     */
    protected $countKey = 'recordsTotal';

    /**
     * Array key for the filtered object count.
     *
     * @var string
     */
    protected $countFilteredKey = 'recordsFiltered';

    /**
     * Array key for the actual result set.
     *
     * @var string
     */
    protected $rowsKey = 'aaData';
    
    protected $draw = 'draw';
    
    public function getArray()
    {
//Debug::debug("Line 66 the options are ",$this->options);
        $this->options['page']=($this->options['start']/$this->options['length']);
        $this->options['size']=$this->options['length'];
//Debug::debug("Line 70 the options are ",$this->options);
        $this->options['filters']['_all']=$this->options['search']['value'];
        
        list($count, $countFiltered, $rows) = $this->getModels();

        // Return sprunjed results
        return [
            $this->draw =>$this->options['draw'],
            $this->countKey           => $count,
            $this->countFilteredKey   => $countFiltered,
            $this->rowsKey            => $rows->values()->toArray(),
            $this->listableKey        => $this->getListable()
        ];
    }
    /**
     * Set the initial query used by your Sprunje.
     */
    protected function baseQuery()
    {
        return $this->classMapper->createInstance($this->name)->newQuery();
    }
    
    /**
     * Get the unpaginated count of items (before filtering) in this query.
     *
     * @param Builder $query
     * @return int
     */
    protected function count($query)
    {
//Debug::debug("Line 540 the sql is ".$query->toSql());
        $thissql = $query->toSql();
        if(stripos($thissql,'group by')!== false)
        {
            $thiscount =  count($query->get());
Debug::debug("Line 105 the sql is  updating the count to ($thiscount) ");
//            $origcount= $query->count();
//Debug::debug("Line 547 the sql is  instead of ($origcount) ");
            return $thiscount;
        }
        else
        {
            return $query->count();
        }
    }

    /**
     * Get the unpaginated count of items (after filtering) in this query.
     *
     * @param Builder $query
     * @return int
     */
    protected function countFiltered($query)
    {
        $thissql = $query->toSql();
        if(stripos($thissql,'group by')!== false)
        {
            $thiscount =  count($query->get());
Debug::debug("Line 128 the sql is  updating the count to ($thiscount) ");
//            $origcount= $query->count();
//Debug::debug("Line 568 the sql is  instead of ($origcount) ");
            return $thiscount;
        }
        else
        {
            return $query->count();
        }
    }
    
}
