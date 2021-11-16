$(document).ready(function(){
    // document.getElementById("contact")
    $("#contact").validate({ //these are json
        debug: true,
        errorClass: "alert alert-danger",
        ErrorLabelContainer: "#output-area",
        errorElement:"div",
        // rules here define what is good or bad input
        //each rule starts with the form input elements name attribute
        rules: {
            inputEmail: {
                email: true,
                required: true
            },
            inputPhone: {
                phoneUS: true,
                required: true
            },
            inputProductType: {
                required: false,
                maxlength: 2000
            },
            inputWood: {
                required: false,
            },
            inputDetails: {
                required: false,
                maxlength: 2000
            }

        },
        messages: {
            inputEmail: {
                required: "Email is a required field"
            },
            inputPhone: {
                required: "Phone number is a required field"
            },
            inputProductType: {
                required: "A message is required",
                maxLength: "Message must be 2000 characters or less"
            },
            inputDetails: {
                maxLength: "Message must be 2000 characters or less"
            }
        },
        submitHandler: (form) => {
            $("#contact").ajaxSubmit({
                type: "POST",
                url: $("#contact").attr('action'),
                success: (ajaxOutput) => {
                    $("#output-area").css("display","")
                    $("#output-area").html(ajaxOutput)

                    if($(".alert-success" >= 1)){
                        $("#contact")[0].reset()
                    }
                }
            })
        }
    })
})