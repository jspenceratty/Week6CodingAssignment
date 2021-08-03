class CD {
    constructor(title, artist) {
        this.title = title;
        this.artist = artist;
        this.tracks = [];
    }

    addTracks(track, name) {
        this.tracks.push(new CDTrack(track, name));
    }
}

class CDTrack {
    constructor(tracknum, name) {
        this.tracknum = tracknum;
        this.name = name;
    }
}

class CDService {
    static url = 'https://crudcrud.com/api/87a64fe652f145e1aafab6594c8229d1/cdsnew';

    static getAllCDs() {
        return $.get(this.url);
    }

    static addCD(cd) {
        /*return $.post(this.url, cd);*/
        return $.ajax({
            url: this.url,
            dataType: "json",
            crossDomain: true,
            data: JSON.stringify(cd),
            type: 'POST',
            contentType: 'application/json'
        });

    }

    static deleteCD(id) {
        return $.ajax({
            url: this.url + `/${id}`,
            crossDomain: true,
            type: 'DELETE'
        });
    }

    static updateCDName(cd) {
        return $.ajax({
            url: this.url + `/${cd._id}`,
            dataType: 'json',
            data: JSON.stringify({
                "title": cd.title,
                "artist": cd.artist,
                "tracks": cd.tracks
            }),
            contentType: 'application/json',
            type: 'PUT'
            
        });
    }

    static updateCD(cd) {

        return $.ajax({
            url: this.url + `/${cd._id}`,
            dataType: 'json',
            data: JSON.stringify({
                "title": cd.title,
                "artist": cd.artist,
                "tracks": cd.tracks
            }),
            contentType: 'application/json',
            type: 'PUT'
            
        });
    }

    static deleteTrack(cd,tracknum,trackname) {
        for (var i = cd.tracks.length -1; i >= 0; i--) {
            if (cd.tracks[i].name == trackname && cd.tracks[i].tracknum == tracknum) {
                cd.tracks.splice(i,1);
            }
        }
        /*cd.tracks.splice(cd.tracks.indexOf(tracknum),1);*/
        return $.ajax({
            url: this.url + `/${cd._id}`,
            dataType: 'json',
            data: JSON.stringify({
                "title": cd.title,
                "artist": cd.artist,
                "tracks": cd.tracks
            }),
            contentType: 'application/json',
            type: 'PUT'
        })
    }
}

class DOMManager {
    static CDs;

    static getAllCDs() {
        CDService.getAllCDs().then(CDs => this.render(CDs));
    }

    static addCD(title, artist) {
        CDService.addCD(new CD(title, artist))
            .then(() => {
                return CDService.getAllCDs();
            })
            .then((CDs) => this.render(CDs));

    }

    static deleteCD(id) {
        CDService.deleteCD(id)
            .then(() => {
                return CDService.getAllCDs();
            })
            .then((CDs) => this.render(CDs));
    }
    
    static updateCDName(id) {
        for (let cd of this.CDs) {
            if (cd._id == id) {
                cd.title = $(`#${cd._id}-new-title`).val()
                cd.artist = $(`#${cd._id}-new-artist`).val()
                CDService.updateCD(cd)
                .then(() => {
                    return CDService.getAllCDs();
                })
                .then((CDs) => {
                    console.log(CDs);
                    this.render(CDs)
                }
                );
            }
        }
        this.render(this.CDs);
    }

    static addTrack(id) {
        for (let cd of this.CDs) {
            if (cd._id == id) {
                cd.tracks.push(new CDTrack($(`#${cd._id}-track-number`).val(), $(`#${cd._id}-track-name`).val()));
                CDService.updateCD(cd)
                    .then(() => {
                        return CDService.getAllCDs();
                    })
                    .then((CDs) => {
                        console.log(CDs);
                        this.render(CDs)
                    }
                    );
                    
                }            

        }
        this.render(this.CDs);
    }

    static deleteTrack(cdID,tracknum,trackname) {
        for (let cd of this.CDs){
            if (cd._id == cdID) {
                CDService.deleteTrack(cd,tracknum,trackname)
                .then(() => {
                    return CDService.getAllCDs();
                })
                .then((CDs) => this.render(CDs));
            }
        }
        this.render(this.CDs);
    }

    static updateTrack(cdID,tracknum,trackname,trackCount) {
        for (let cd of this.CDs) {
            if (cd._id == cdID) {
                for (var i = cd.tracks.length -1; i >= 0; i--) {
                    if (cd.tracks[i].name == trackname && cd.tracks[i].tracknum == tracknum) {
                        cd.tracks.splice(i,1);
                    }
                }
                cd.tracks.push(new CDTrack($(`#${cd._id}-track-${trackCount}-track-number`).val(), $(`#${cd._id}-track-${trackCount}-track-name`).val()));
            }
            CDService.updateCD(cd)
            .then(() => {
                return CDService.getAllCDs();
            })
            .then((CDs) => this.render(CDs));
        }
        this.render(this.CDs);
    }

    static render(CDs) {
        this.CDs = CDs;
        $('#cd-list').empty();

        for (let cd of CDs) {
            $('#cd-list').prepend(
                `
                <div class="container">
                    <div id="${cd._id}" class="card">
                        <div class="card-header">
                            <div id="${cd._id}-edit-section" style="display:none;">
                                <input type="text" id="${cd._id}-new-title" value="${cd.title}">
                                <input type="text" id="${cd._id}-new-artist" value="${cd.artist}">
                                <button class="btn btn-success btn-sm" onclick="DOMManager.updateCDName('${cd._id}')">Save Changes</button>
                                <button class="btn btn-warning btn-sm" onclick="$('#${cd._id}-edit-section').css('display','none');$('#${cd._id}-read-section').css('display','inline-block');">Cancel</button>
                            </div>
                            <div id="${cd._id}-read-section">
                                <h3 id = "cd-title-header" style="display: inline-block;">${cd.title} - ${cd.artist}</h3>
                                <button class="btn btn-outline-warning btn-sm" onclick="$('#${cd._id}-edit-section').css('display','inline-block');$('#${cd._id}-read-section').css('display','none');">Edit CD</button>
                                <button class="btn btn-danger" style="display: inline-block; float: right;"  onclick="DOMManager.deleteCD('${cd._id}')">Delete CD</button>
                            </div>
                        </div>
                        <div class="card-body">
                            <div class="container" style="border: solid 1px black; padding: 5px;">
                                <div class="card">
                                    <div class="row">
                                           <div class="col-sm">
                                                <input type="number" id="${cd._id}-track-number" class="form-control " placeholder="Track Number">
                                            </div>
                                            <div class="col-sm">
                                                <input type="text" id="${cd._id}-track-name" class="form-control" placeholder="Track Name">
                                            </div>
                                            <div class="col-sm">
                                                <button id="${cd._id}-new-track" onclick="DOMManager.addTrack('${cd._id}')" class="btn btn-success btn-sm">Add Track</button>
                                            </div>
                                        
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                                                            
                <hr>
            `
            );
            $(`#${cd._id}`).find('.card-body').append(
                `
                <table id="${cd._id}-song-table" class="container">
                    <tr>
                        <th>Track #</th>
                        <th>Song</th>
                        <th></th>
                    <tr>
                </table>
                `
            );
            let theCount = 0;
            for (let track of cd.tracks) {
                $(`#${cd._id}`).find(`#${cd._id}-song-table tr:last`).after(
                    `
                    <tr id="${cd._id}-track-${theCount}-read-section">
                       <td>
                            <span id="track-${track.tracknum}">${track.tracknum}</span>
                        </td>
                        <td>
                            <span id="name-${track.tracknum}">${track.name}</span>
                        </td>
                        <td>
                            <button class="btn btn-outline-warning btn-sm" onclick="$('#${cd._id}-track-${theCount}-read-section').hide(); $('#${cd._id}-track-${theCount}-edit-section').show();">Edit Track</button>
                            <button class="btn btn-danger btn-sm"  onclick="DOMManager.deleteTrack('${cd._id}','${track.tracknum}','${track.name}')">Delete Track</button>
                        </td>
                    </tr>
                    <tr id="${cd._id}-track-${theCount}-edit-section">
                       <td>
                            <input type="number" id="${cd._id}-track-${theCount}-track-number" class="form-control " value="${track.tracknum}">
                        </td>
                        <td>
                            <input type="text" id="${cd._id}-track-${theCount}-track-name" class="form-control " value="${track.name}">
                        </td>
                        <td>
                            <button class="btn btn-success btn-sm" onclick="DOMManager.updateTrack('${cd._id}','${track.tracknum}','${track.name}',${theCount})">Save Changes</button>
                            <button class="btn btn-outline-warning btn-sm" onclick="$('#${cd._id}-track-${theCount}-read-section').show(); $('#${cd._id}-track-${theCount}-edit-section').hide();">Cancel</button>
                        </td>
                    </tr>
                    `
                )
                
                $(`#${cd._id}-track-${theCount}-edit-section`).hide()
                theCount ++
            }
            
        }
    }
}

/*DOMManager.addCD('Second CD','Second Artist');*/

function addNewCD() {
    DOMManager.addCD($('#new-cd-name').val(), $('#new-cd-artist').val());
    $('#new-cd-name').val('');
    $('#new-cd-artist').val('');
}

DOMManager.getAllCDs();
