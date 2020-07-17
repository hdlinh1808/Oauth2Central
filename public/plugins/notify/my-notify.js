function notify() {
    $.notify({
        // options
        message: 'Hello World'
    }, {
        // settings
        z_index: 1000000,
        type: 'info',
        animate: {
            enter: 'animated fadeInUp',
            exit: 'animated fadeOutRight'
        },
    });
}