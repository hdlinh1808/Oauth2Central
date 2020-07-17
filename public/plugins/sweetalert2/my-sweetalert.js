const SweetToastAlert = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
});

function sweetToastAlertSuccess(msg) {
    sweetToastAlert('success', msg);
}

function sweetToastAlertError(msg) {
    sweetToastAlert('error', msg);
}

function sweetToastAlertWarning(msg) {
    sweetToastAlert('warning', msg);
}

function sweetToastAlert(type, msg) {
    SweetToastAlert.fire({
        icon: type,
        title: msg,
    })
}