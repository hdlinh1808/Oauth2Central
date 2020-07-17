jQuery.fn.enableButtonLoading = function () {
    var $this = $(this);
    var loadingText = $this.data("loading-text");
    $this.data('original-text', $(this).html());
    $this.html(loadingText);
    $this.prop('disabled', true);
}

jQuery.fn.resetButtonLoading = function () {
    var $this = $(this);
    var originText = $this.data("original-text");
    $this.data('origienal-text', $(this).html());
    $this.html(originText);
    $this.prop('disabled', false);
}