var isProcessed = false;
var server_url = '';
var global_filename = '';
var youtube = false;

(function() {
    // Initialize Firebase
     var frames = []
        var firebaseConfig = {
            apiKey: "AIzaSyA5SRwsOGxvkL6DLA1DFmL7iIUAVxrTsr0",
            authDomain: "videosurfer-bad23.firebaseapp.com",
            databaseURL: "https://videosurfer-bad23.firebaseio.com",
            projectId: "videosurfer-bad23",
            storageBucket: "videosurfer-bad23.appspot.com",
            messagingSenderId: "931651516843",
            appId: "1:931651516843:web:c5ad09b8a2a6abffeb3aee",
            measurementId: "G-RCC2W1BE68"
        };
        // Initialize Firebase
        firebase.initializeApp(firebaseConfig);    
        var selectedTask = ''

        $(document).on("change", ".file_multi_video", function(evt) {
            var $source = $('#video_here');
            $source[0].src = URL.createObjectURL(this.files[0]);
            $source.parent()[0].load();
        });
        var dropdown = document.getElementById('options')
        dropdown.addEventListener('change', e => {
            selectedTask = dropdown.value
        })
        $('#youtube_link').hide()
        server_url = 'https://vidsurfer-fl274rflea-uc.a.run.app';

        //google("https://i.imgur.com/wkAwL3J.jpg")
        console.log("begin now")
        $('#loading').hide();
        document.getElementById('submit').addEventListener('click', e => {
            console.log("works!")
            if(selectedTask !== '') {
                $('#loading').show()
                const filesToUpload = document.getElementsByClassName('file_multi_video')[0].files
                let video_link = document.getElementById('url').value
                let description = document.getElementById('description').value
                if(video_link != '' && filesToUpload.length != 0)
                    alert("Please, either remove the URL or refresh the page to remove the uploaded video")
                else if(video_link == '' && filesToUpload.length == 0)
                    alert("Please, either paste the URL or upload the video to process")
                else {
                    if(filesToUpload.length != 0) {
                        var fd = new FormData();
                        fd.append('video', filesToUpload[0])
                        $.ajax({
                            url: `${server_url}/process_video`,
                            type: 'PUT',
                            data: fd,
                            contentType: false,
                            processData: false,
                            success: function(result) {
                                // Do something with the result,
                                console.log(result)
                                search(selectedTask, result, description)
                            },
                            error: function(e) {
                                console.log(e);
                            },
                        });

                    }
                    else 
                    {
                        var formdata = new FormData();
                        formdata.append('url', video_link)
                        $('#youtube_link').show()
                        youtube = true; 
                        $('#video').hide()
                        var video_id = video_link.split("=")[1]
                        document.getElementById('youtube_link').src = `https://www.youtube.com/embed/${video_id}`
                        getUrlVideo(selectedTask, formdata, description) 
                    }


                }
            }
            else 
                alert("Please, choose one of the actions to take in the dropdown menu")
        })
}());      
    
function getUrlVideo(selectedTask, data, description) {
    if(isProcessed) {
        search(selectedTask, result, description);
    }
    else {
        $.ajax({
            url:  `${server_url}/process_video`,
            type: 'POST',
            contentType: false,
            processData: false,
            data: data,
            success: function(result) {
                // Do something with the result,
                console.log(result)
                isProcessed = true;
                search(selectedTask, result, description)

            },
            error: function(e) {
                console.log(e);
            },
        });
    }
}

function google(url_to_image){
    var xhr = new XMLHttpRequest();
    var formData = new FormData();
    let google = "https://www.google.com/searchbyimage?"
    let image_link = url_to_image 
    let url_specify = "site=search&image_url="
    var request_url = google + url_specify + image_link
    formData.append('url', request_url) 
    xhr.open("POST", `${server_url}/google`);
    xhr.onload = function (e) {
    if (xhr.readyState === 4) {
        if (xhr.status === 200) {
            let html = xhr.responseText;
            let description = html.substring(html.indexOf('title="Search" value="') + 22, html.indexOf(' aria-label="Search"') - 1)
            getEbayDescription(google + "q=" + description + "+ebay&" + url_specify + image_link)
            console.log(description)
        } else {
            console.error(xhr.statusText);
        }
    }
    };
    xhr.onerror = function (e) {
    console.error(xhr.statusText);
    };
    xhr.send(formData); 
}

function getEbayDescription(url) {
    console.log(url)
    let ebay_descriptions = ''
    var xhr = new XMLHttpRequest();
    var formData = new FormData();
    formData.append('url', url)
    xhr.open("POST", `${server_url}/google`, true);
    xhr.onload = function (e) {
    if (xhr.readyState === 4) {
        if (xhr.status === 200) {
            let html = xhr.responseText;
            var allProducts = new Set();
            let index = 1, ebay_description;
            while(index >= 0){
                index = html.indexOf("https://www.ebay.com/itm/", index + 1)
                if(index >= 0){
                    ebay_description = html.substring(index + 25, html.indexOf("/", index + 26))
                    if(!allProducts.has(ebay_description))
                    {
                        allProducts.add(ebay_description)
                        ebay_description = ebay_description.split("-").join(" ");
                        ebay_descriptions = `${ebay_descriptions} - ${ebay_description} `
                    }
                }
            }

            console.log(ebay_descriptions)
            getEbayProducts(ebay_descriptions.toLowerCase())

        } else {
            console.error(xhr.statusText);
        }
    }
    };
    xhr.onerror = function (e) {
    console.error(xhr.statusText);
    };
    xhr.send(formData); 
}

function getEbayProducts(data) {
    var formdata = new FormData();
    formdata.append('list', data)
    $.ajax({
        url:  `${server_url}/get_ebay_products`,
        type: 'POST',
        contentType: false,
        processData: false,
        data: formdata,
        success: function(result) {
            // Do something with the result,
            var allResults = Object.values(result)[0]
            console.log("All results are " + allResults)
            var row = document.createElement('div')
            row.className = 'row list'
            for(var i = 0; i < allResults.length; i++)
            {
                var col = document.createElement('div')
                col.className = "col-md-3 postCover"
                var divCover = document.createElement('div')
                divCover.className = "cover"
                var image = document.createElement('img')
                image.src = allResults[i].url
                var divName = document.createElement('div')
                divName.className = "name"
                divName.innerHTML = allResults[i].title.toLowerCase()
                var divPrice = document.createElement('div')
                divPrice.className = "coverPrice"
                divPrice.innerHTML = "$ " + allResults[i].price
                divPrice.style.fontWeight = "bold";
                divCover.appendChild(divName)
                divCover.appendChild(divPrice)
                col.appendChild(image)
                col.appendChild(divCover)
                row.appendChild(col)
            }

            document.getElementById('ebayPosts').appendChild(row)
        },
        error: function(e) {
            console.log(e);
        },
    });
}


function search(action, filename, description) {
    var data = new FormData()
    data.append('filename', filename.split('.')[0])
    data.append('inp', description)
    $.ajax({
        url:  `${server_url}/search/` + action,
        type: 'POST',
        contentType: false,
        processData: false,
        data: data,
        success: function(result) {
            // Do something with the result,
            console.log("Here " + result)
            processResponse(action, result, filename)
        },
        error: function(e) {
            console.log(e);
        },
    });
}

function processResponse(action, result, filename) {
    console.log("shopping?")
    if(action === "shopping")
    {
        var all_image_links = []
        if(result['urls'].length > 1)
            index = Math.floor(randomNumber(0, result['urls'].length - 1))
        else
            index = 0

        all_image_links.push(result['urls'][index])

        //if(result['urls'].length > 1)
            //all_image_links.push(result['urls'][result['urls'].length - 1])

        for(var i = 0; i < all_image_links.length; i++)
        {
            console.log(all_image_links[i])
            google(all_image_links[i])
        }
    }
    frames = result['sec_frame']

    if(youtube === false)
    {
        var video = document.getElementById('video')
        if(action === 'caption')
            result['sec_frame'] /= 2
        video.currentTime = Math.floor(result['sec_frame'])
        console.log(result['sec_frame'])
        video.play()
    }
    else 
    {
        var original_url = document.getElementById('youtube_link').src;
        var start_frame = Math.floor(result['sec_frame'])
        console.log(result['sec_frame'])
        document.getElementById('youtube_link').src = `${original_url}?start=${start_frame}&autoplay=1`
    }

    global_filename = filename
    $('#loading').hide()
}   

window.addEventListener("beforeunload", () => { 
    function sleep(delay) {
        const start = new Date().getTime();
        while (new Date().getTime() < start + delay);
    }

    if(global_filename !== '')
        delete_cache(global_filename)

    sleep(1500)
});

function randomNumber(min, max) {  
    return Math.random() * (max - min) + min; 
}  

function delete_cache(filename) {
    var data = new FormData()
    data.append('filename', filename.split('.')[0])
    $.ajax({
        url:  `${server_url}/delete_cache`,
        type: 'POST',
        async: false,
        contentType: false,
        processData: false,
        data: data,
        success: function(result) {
            // Do something with the result,
            console.log("Cache is deleted")
        },
        error: function(e) {
            console.log(e);
        },
    });
}