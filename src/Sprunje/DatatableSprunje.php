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
class DatatableSprunje extends Sprunje
{
    public function getArray()
    {
        list($count, $countFiltered, $rows) = $this->getModels();

        // Return sprunjed results
        return [
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
    
    
}
