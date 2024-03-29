<?php

/**
 * Core configuration file for Chinmaya.  You must override/extend this in your site's configuration file.
 *
 * Sensitive credentials should be stored in an environment variable or your .env file.
 * Database password: DB_PASSWORD
 * SMTP server password: SMTP_PASSWORD
 */
return [
    'timezone' => 'America/Chicago',
    'site' => [
        'title' => 'Datatables Sprinkle for UserFrosting',
        'author' => 'Srinivas Nukala'
    ],
    'debug' => [
        'queries' => false
    ],
    'dt'=>['logo'=>'assets://dt/images/cm-aum-flower04.png']
];