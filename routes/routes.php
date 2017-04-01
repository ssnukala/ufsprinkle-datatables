<?php
/**
 * Chinmaya Registration Sevak (http://www.chinmayacloud.com)
 *
 * @link      https://github.com/chinmaya.regsevak
 * @copyright Copyright (c) 2013-2016 Srinivas Nukala
 * @license   https://github.com/chinmaya.regsevak/blob/master/licenses/UserFrosting.md (MIT License)
 */

$app->group('/api/sndatatable', function () {
    $this->delete('/d/{source_name}', 'UserFrosting\Sprinkle\SNDatatable\Controller\SNDatatablesController:populateDatatable');

    $this->get('', 'UserFrosting\Sprinkle\Admin\Controller\UserController:getList');

    $this->get('/u/{user_name}', 'UserFrosting\Sprinkle\Admin\Controller\UserController:getInfo');

    $this->get('/u/{user_name}/activities', 'UserFrosting\Sprinkle\Admin\Controller\UserController:getActivities');

    $this->get('/u/{user_name}/roles', 'UserFrosting\Sprinkle\Admin\Controller\UserController:getRoles');

    $this->post('', 'UserFrosting\Sprinkle\Admin\Controller\UserController:create');

    $this->post('/u/{user_name}/password-reset', 'UserFrosting\Sprinkle\Admin\Controller\UserController:createPasswordReset');

    $this->put('/u/{user_name}', 'UserFrosting\Sprinkle\Admin\Controller\UserController:updateInfo');

    $this->put('/u/{user_name}/{field}', 'UserFrosting\Sprinkle\Admin\Controller\UserController:updateField');
});