$(document).ready(() => {
    $('#profile-form').submit((event) => {
        event.preventDefault();
        /*
        $.ajax({
            url: '/users/status',
            method: 'PUT',
            data: { status: $('#status').find(':selected').val() },
            dataType: 'json',
            success: () => {
                location.reload();
            },
            error: (err) => {
                console.error('status update somehow error', err);
            },
        });
        */
    });
});

async function updateProfile(e) { // eslint-disable-line no-unused-vars
    e.preventDefault();
    $('#profileSubmit')
        .prop('disabled', true)
        .append('<span class="spinner-border spinner-border-sm"></span>');
    await new Promise((resolve) => setTimeout(resolve, 2000));
    $('#profileSubmit').prop('disabled', false).empty().text('Submit ');
    return false;
}
