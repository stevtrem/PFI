
// the following will generate an imageDownloader control
// <div class='imageDownloader' id = 'photo' defautImageSrc='images/No_image.png'>
//
// Use setImageDownloaderBlankImage(id) to set imageDownloader image to No_image.png
// setImageDownloaderImage(id, url) to set imageDownloader image to image url
//
// Use getImageData(id) to extract downloaded base64 image data
// Use clearImageData(id) to clear imageData


$(() => {
    $('.imageDownloader').each(function() {
        let id = $(this).attr('id');
        let defaultImage = $(this).attr('defautImageSrc');
        $(this).append('<img id="' +
                        id +
                        '_UploadedImage" class="UploadedImage" src="' +
                        defaultImage +
                        '">');
        $(this).append('<input type="hidden" id="' +
                        id +
                        '_ImageData" value="">');
        $(this).append('<input id="' +
                        id +
                        '_ImageUploader" type="file" ' +
                        'style="display:none" accept="image/jpeg,image/gif,image/png,image/bmp">');
        ImageUploader_AttachEvent(id);
    })
})

function setImageDownloaderBlankImage(id) {
    $('#' + id + '_UploadedImage').attr("src", "images/No_image.png");
}
function setImageDownloaderImage(id, url){
    $('#' + id + '_UploadedImage').attr("src", url);
}



function ImageUploader_AttachEvent(id) {
    document.querySelector('#' + id + '_ImageUploader').addEventListener('change', preLoadImage);
    // un click sur l'image sera transmis au input #ImageUploader
    document.querySelector('#' + id + '_UploadedImage').addEventListener('click', () => {
        document.querySelector('#' + id + '_ImageUploader').click();
    });
}

function clearImageData(id) {
    document.querySelector('#' + id + '_ImageData').value = "";
}
function getImageData(id) {
    return document.querySelector('#' + id + '_ImageData').value;
}
function setImageData(id, value) {
    document.querySelector('#' + id + '_ImageData').value = value;
}

function resetUploadedImageSrc(id) {
    let defautImage = $('#' + id).attr('defautImageSrc');
    $('#' + id + '_UploadedImage').attr('src', defautImage);
}

function setUploadedImageSrc(id, src){
    document.querySelector('#' + id + '_UploadedImage').setAttribute('src', src);
}

function preLoadImage(event) {
    let id = event.target.id.split('_')[0];
    let UploadedImage = document.querySelector('#' + id + '_UploadedImage');
    let ImageUploader = document.querySelector('#' + id + '_ImageUploader');
    let ImageData = document.querySelector('#' + id + '_ImageData');
    if (UploadedImage !== null) {
        let len = ImageUploader.value.length;

        if (len !== 0) {
            let fname = ImageUploader.value;
            let ext = fname.split('.').pop().toLowerCase();

            if ((ext !== "png") &&
                (ext !== "jpg") &&
                (ext !== "jpeg") &&
                (ext !== "bmp") &&
                (ext !== "gif")) {
                alert("Ce n'est pas un fichier d'image de format reconnu. Sélectionnez un autre fichier.");
            }
            else {
                let fReader = new FileReader();
                
                fReader.readAsDataURL(ImageUploader.files[0]);
                fReader.onloadend = () => {
                    UploadedImage.src = fReader.result;
                    ImageData.value = UploadedImage.src;//.split(',').pop();
                    console.log(ImageData.value);
                };
            }
        }
        else {
           // UploadedImage.src = null;
        }
    }
    return true;
}