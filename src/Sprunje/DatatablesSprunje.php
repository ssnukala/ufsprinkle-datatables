<?php

/**
 * UserFrosting (http://www.userfrosting.com)
 *
 * @link      https://github.com/userfrosting/UserFrosting
 * @license   https://github.com/userfrosting/UserFrosting/blob/master/licenses/UserFrosting.md (MIT License)
 */

namespace UserFrosting\Sprinkle\Datatables\Sprunje;

use Carbon\Carbon;
use Illuminate\Database\Capsule\Manager as Capsule;
use UserFrosting\Sprinkle\Core\Facades\Debug;
use UserFrosting\Sprinkle\Core\Sprunje\Sprunje;
use UserFrosting\Sprinkle\Core\Facades\Config;
use Illuminate\Support\Str;
use Illuminate\Support\Arr;
use League\Csv\Writer;


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
     * Current Logged in User so we can use this to figure out roles etc 
     * this will help in filtering the data based on the user's role
     * 
     * @var string
     */
    protected $currentUser;


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
     * name variable
     *
     * @name string - name of the table for this sprunje.
     */
    protected $name = 'not_set';

    /**
     * $exportable variable
     *
     * @$exportable array - list of fields that should be part of the CSV export.
     * default is blank so the sprunje will not allow any exports for security reasons
     */
    protected $exportable = false;

    /**
     * Array key for the actual result set.
     *
     *     "message": "SQLSTATE[42S22]: Column not found: 1054 Unknown column 'status1' in 
     * 'where clause' (SQL: select count(*) as aggregate from `uf_message` 
     * where `user_id` = 1 and `status1` = A and `uf_message`.`deleted_at` is null)",

     * @var string
     */
    protected $rowsKey = 'aaData';
    protected $draw = 'draw';
    protected $destination = 'datatable';

    /**
     * $lookup 
     * Array of fields that will be used to filter when lookup is initiated,
     * so "lookup" will become a filterable field. 
     * Useful when building Autolookup via Ajax from the frontend
     *
     * @var array
     */
    protected $lookup = [];

    /**
     * $lookup_return 
     * Array of fields that will be returned in the Lookup Ajax call,
     * Provide a mapping to the fields to be used to map the lookup return values
     * needs to have the following {id,title,text,selection}
     * Useful when building Autolookup via Ajax from the frontend
     *
     * @var array
     */
    protected $lookup_map = [
        'id' => 'id', 'title' => 'not-set', 'text' => 'not-set', 'selection' => 'not-set'
    ];

    public function setCurrentUser($value)
    {
        $this->currentUser = $value;
    }

    public function getCurrentUser()
    {
        return $this->currentUser;
    }

    public function addFilterable($field)
    {
        if (!array_key_exists($field, (array) $this->filterable)) {
            $this->filterable[] = $field;
        }
    }

    public function addLookup($field)
    {
        if (!array_key_exists($field, (array) $this->lookup)) {
            $this->lookup[] = $field;
        }
    }

    public function setDestination($value)
    {
        $this->destination = $value;
    }

    public function getDestination()
    {
        return $this->destination;
    }

    public function setExportable($fields)
    {
        $this->exportable = $fields;
    }

    /**
     * getExportable function
     *
     * @return false if the array is empty
     */

    public function getExportable()
    {
        return $this->exportable;
    }

    /**
     * Set the initial query used by your Sprunje.
     */
    protected function baseQuery()
    {
        return $this->classMapper->createInstance($this->name)->newQuery();
    }

    public function setFormat($format)
    {
        $this->options['format'] = $format;
    }

    public function getFormat()
    {
        return $this->options['format'];
    }

    /**
     * Set any transformations you wish to apply to the collection, after the query is executed.
     *
     * @param \Illuminate\Database\Eloquent\Collection $collection
     *
     * @return \Illuminate\Database\Eloquent\Collection
     */
    protected function applyTransformations($collection)
    {
        //Debug::debug("Line 164 in ApplyTransformations DatatableSprunje Destination" . $this->destination);
        if ($this->destination == 'lookup') {
            $collection = $this->transformLookup($collection);
        }
        return $collection;
    }


    /**
     * Execute the query and build the results, and append them in the appropriate format to the response.
     *
     * @param ResponseInterface $response
     * @return ResponseInterface
     */
    public function toResponse($response)
    {
        $format = $this->options['format'];
        //Debug::debug("Line 81 $format is the return format and destination is " . $this->destination);
        switch ($format) {
            case 'csv': {
                    $result = $this->getCsv();
                    if ($result == false) {
                        return $response->withStatus(400, 'Noting to export');
                    } else {
                        // Prepare response
                        $settings = http_build_query($this->options);
                        $date = Carbon::now()->format('Ymd');
                        $response = $response->withAddedHeader('Content-Disposition', "attachment;filename=$date-{$this->name}-$settings.csv");
                        $response = $response->withAddedHeader('Content-Type', 'text/csv; charset=utf-8');
                        return $response->write($result);
                        // Default to JSON
                    }
                }
            case 'array': {
                    $result = $this->getArray();
                    return $result;
                }
            case 'dtcsv': {
                    $this->destination = 'dtcsv';
                    $result = $this->getDtCsv();
                    if ($result == false) {
                        return $response->withStatus(400, 'Noting to export');
                    } else {
                        return $response->withJson($result, 200, JSON_PRETTY_PRINT);
                    }
                }
            default: {
                    $result = $this->getArray();
                    return $response->withJson($result, 200, JSON_PRETTY_PRINT);
                }
        }
    }

    public function getArray()
    {
        //Debug::debug("Line 52 the options are ", $this->options);
        $this->options['page'] = ($this->options['start'] / $this->options['length']);
        $this->options['size'] = $this->options['length'] == -1 ? 'all' : $this->options['length'];
        //Debug::debug("Line 55 the options are ", $this->options);
        if (isset($this->options['search']['value']) && $this->options['search']['value'] != '') {
            $this->options['filters']['_all'] = $this->options['search']['value'];
        }

        // Srinivas 1/28/2020 : not using this now, using the Filters instead, may use this in future
        if (isset($this->options['dt_where'])) {
            //Debug::debug("Line 59 the DT Where is ", $this->options['dt_where']);
            $dtwhere = $this->options['dt_where'];
            $this->extendQuery(function ($query) use ($dtwhere) {
                foreach ($dtwhere as $col => $value) {
                    //Debug::debug("Line 67 Setting where $col = $value");
                    $query->where($col, $value);
                }
                return $query;
            });
        }
        //Debug::debug("Line 238 getting models now");
        list($count, $countFiltered, $rows) = $this->getModels();
        //Debug::debug("Line 240 aftergetting models getting models now");

        // Return sprunjed results
        $rowkeys = count($rows) > 0 ? $rows->values()->toArray() : [];
        $retarr =  [
            $this->draw => $this->options['draw'],
            $this->countKey => $count,
            $this->countFilteredKey => $countFiltered,
            $this->rowsKey => $rowkeys
        ];
        if (isset($this->options['datatable']) && $this->options['datatable']['get_listable'] == 'Y') {
            //Debug::debug("Line 252 getting listable");
            $retarr[$this->listableKey] = $this->getListable();
        } else {
            $retarr[$this->listableKey] = [];
        }
        return $retarr;
    }

    public function getCsv()
    {
        $columnNames = $this->getExportable();
        if ($columnNames === false) {
            return false;
        } else {

            $filteredQuery = clone $this->query;

            // Apply filters
            $this->applyFilters($filteredQuery);

            // Apply sorts
            $this->applySorts($filteredQuery);

            $collection = collect($filteredQuery->get());

            // Perform any additional transformations on the dataset
            $this->applyTransformations($collection);

            $csv = Writer::createFromFileObject(new \SplTempFileObject());
            //$columnNames = $this->getExportable();
            if ($columnNames == '*') {
                $columnNames = [];
                // Flatten collection while simultaneously building the column names from the union of each element's keys
                $collection->transform(function ($item, $key) use (&$columnNames) {
                    $item = Arr::dot($item->toArray());
                    foreach ($item as $itemKey => $itemValue) {
                        if (!in_array($itemKey, $columnNames)) {
                            $columnNames[] = $itemKey;
                        }
                    }
                    return $item;
                });
            }
            /*
        // Flatten collection while simultaneously building the column names from the union of each element's keys
        $collection->transform(function ($item, $key) use (&$columnNames) {
            $item = Arr::dot($item->toArray());
            foreach ($item as $itemKey => $itemValue) {
                if (!in_array($itemKey, $columnNames)) {
                    $columnNames[] = $itemKey;
                }
            }

            return $item;
        });
*/
            $csv->insertOne($columnNames);

            // Insert the data as rows in the CSV document
            $collection->each(function ($item) use ($csv, $columnNames) {
                $row = [];
                foreach ($columnNames as $itemKey) {
                    // Only add the value if it is set and not an array.  Laravel's array_dot sometimes creates empty child arrays :(
                    // See https://github.com/laravel/framework/pull/13009
                    if (isset($item[$itemKey]) && !is_array($item[$itemKey])) {
                        $row[] = $item[$itemKey];
                    } else {
                        $row[] = '';
                    }
                }

                $csv->insertOne($row);
            });

            return $csv;
        }
    }

    public function getDtCsv()
    {
        $columnNames = $this->getExportable();
        //if (is_array($columnNames)) {
        //Debug::debug("Line 351 getExportable is $columnNames", $columnNames);
        //} else {
        //Debug::debug("Line 354 getExportable is $columnNames");
        //}
        $dtcsv = ['header' => [], 'body' => []];
        if ($columnNames === false) {
            return false;
        } else {
            $filteredQuery = clone $this->query;

            // Apply filters
            $this->applyFilters($filteredQuery);

            // Apply sorts
            $this->applySorts($filteredQuery);

            $collection = collect($filteredQuery->get());

            // Perform any additional transformations on the dataset
            $this->applyTransformations($collection);

            //$columnNames = $this->getExportable();
            if ($columnNames == '*') {
                $columnNames = [];
            }
            // Flatten collection while simultaneously building the column names from the union of each element's keys
            $collection->transform(function ($item, $key) use (&$columnNames) {
                if (count($columnNames) > 0) {
                    $item = collect($item->only($columnNames));
                }
                $item = Arr::dot($item->toArray());
                foreach ($item as $itemKey => $itemValue) {
                    if (!in_array($itemKey, $columnNames)) {
                        $columnNames[] = $itemKey;
                    }
                }
                return $item;
            });

            if (is_array($columnNames)) {
                $dtcsv['header'] = $columnNames;
                // Insert the data as rows in the CSV document
                foreach ($collection as $item) {
                    //$collection->each(function ($item) use ($dtcsv, $columnNames) {
                    $row = [];
                    foreach ($columnNames as $itemKey) {
                        // Only add the value if it is set and not an array.  Laravel's array_dot sometimes creates empty child arrays :(
                        // See https://github.com/laravel/framework/pull/13009
                        if (isset($item[$itemKey]) && !is_array($item[$itemKey])) {
                            $row[] = $item[$itemKey];
                        } else {
                            $row[] = '';
                        }
                    }
                    $dtcsv['body'][] = $row;
                }
            }
        }
        return $dtcsv;  // this will return blank array if nothing is exportable
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
        if (stripos($thissql, 'group by') !== false) {
            $thiscount = count($query->get());
            //            Debug::debug("Line 105 the sql is  updating the count to ($thiscount) ");
            //            $origcount= $query->count();
            //Debug::debug("Line 547 the sql is  instead of ($origcount) ");
            return $thiscount;
        } else {
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
        if (stripos($thissql, 'group by') !== false) {
            $thiscount = count($query->get());
            //            Debug::debug("Line 128 the sql is  updating the count to ($thiscount) ");
            //            $origcount= $query->count();
            //Debug::debug("Line 568 the sql is  instead of ($origcount) ");
            return $thiscount;
        } else {
            return $query->count();
        }
    }

    // Add Lookup Methods - this will feed the Autolookup for Select2 in the frontend

    protected function filterLookup($query, $value)
    {
        //Debug::debug("Line 423 in filterLookup with $value", $this->lookup);
        // Split value on separator for OR queries
        $values = explode($this->orSeparator, $value);
        $lookup = $this->lookup;
        $query->where(function ($query) use ($values, $lookup) {
            foreach ($values as $value) {
                foreach ($lookup as $lfield) {
                    $query->orLike($lfield, $value);
                }
            }
        });
        return $this;
    }

    public function transformLookup($collection)
    {
        //Debug::debug("Line 438 in ApplyTransformations DatatableSprunje Destination" . $this->destination);

        if ($this->destination == 'lookup') {
            $lookup_map = $this->lookup_map;
            //Debug::debug("Line 438 in ApplyTransformations DatatableSprunje Lookup Map ", $lookup_map);
            $collection->transform(function ($item, $key) use ($lookup_map) {
                $lookuprec = [];
                foreach ($lookup_map as $lookup_field => $db_field) {
                    $lookuprec[$lookup_field] = $item->$db_field;
                }
                return $lookuprec;
            });
            return $collection;
            /* $collection->transform(function ($family, $key) {
                $lookupfields = [
                    'id', 'first_name', 'last_name', 'full_name', 'short_name', 'type',
                    'email', 'mobile_phone'
                ];
                $filtered = $family->only($lookupfields);
                $filtered['text'] = $family->short_name;
                return $filtered;
            });
            */
        }
    }

    public function filterStatus($query, $value)
    {
        if ($value != '' && $value != 'ALL') {
            $values = explode($this->orSeparator, $value);
            $query->where(function ($query) use ($values) {
                foreach ($values as $value) {
                    $query->orWhere('status', $value);
                }
            });
            //$query->orWhere('status', $value);
        }
    }
}
