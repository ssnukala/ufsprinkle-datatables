# ufsprinkle-datatables

Datatables Sprinkle for Userfrosting

> This version only works with UserFrosting 4.1.x !

## Instructions

I am in the process of adding instructions and documentation. in the meantime please check out my test sprinkle
[Sevak Sprinkle for Userfrosting](https://github.com/ssnukala/ufsprinkle-sevak) for a live demo on how to use this.

## Key Features

- Table definitions using YAML file
- Utilizes [Data Sprunjing](https://learn.userfrosting.com/database/data-sprunjing)
- Implements customized colum formatting and markup
- Optimized Ajax calls

## schema template for datatable fields

```
    "status": {
        "name": "status",
        "title": "Status",
        "type": "select",
        "data": "status",
        "default": "",
        "orderable": false,
        "searchable": false,
        "visible": false,
        "class": "dt_column status",
        "padding": "",
        "width": ""
    }
```

## TO-DOs

- Add in-line documentation
- Write tests
- Implement DOM based datatable using Twig Functions by creating [Twig Template Function](https://github.com/ssnukala/ufsprinkle-datatables/blob/master/src/Twig/DatatablesExtension.php#L42) (not sure if this is a good idea :-)
- Convert [Datatable Utility Javascript](https://github.com/ssnukala/ufsprinkle-datatables/blob/master/assets/local/js/datatable_util.js) into jQuery plugin like one we have for Tablesorter (ufTable)
- implement select https://datatables.net/extensions/select/
