# ufsprinkle-datatables
Datatables Sprinkle for Userfrosting

> This version only works with UserFrosting 4.1.x !

## Instructions
I am in the process of adding instructions and documentation. in the meantime please check out my test sprinkle
[Sevak Sprinkle for Userfrosting](https://github.com/ssnukala/ufsprinkle-sevak) for a live demo on how to use this. 

## Key Features
* Table definitions using YAML file
* Utilizes [Data Sprunjing] (https://learn.userfrosting.com/database/data-sprunjing)
* Implements customized colum formatting and markup
* Optimized Ajax calls

## schema template for datatable fields
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
