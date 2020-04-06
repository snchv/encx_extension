/*
MIT License

Copyright (c) 2018 Eugene Lapeko

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

class GameTaskManager extends GameManager {
  _titleUpdated(ln, lc){
    return this.title != `${ln}/${lc}`;
  }

  // _openSectorList(sectors){
  //   var i, result = "";
  //   for (i = 0; i < sectors.length; i++){
  //     if (sectors[i].IsAnswered == false)
  //       result += `${(result != "") ? ", " : ""}${sectors[i].Name}`;
  //   }
  //   return result;
  // }

// return only unique sectors
  _openSectorList(sectors){
    var result = [];
    for (let i = 0; i < sectors.length; i++) {
      if (sectors[i].IsAnswered == false) {
        result.push(" " + sectors[i].Name);
      }
    }
    return uniq_fast(result);
  }

  _sectorsClosingSpeed(storage){
    var sec_speed = Math.floor((ENEXT.currentTimestamp() -
                    ENEXT.convertTimestamp(storage.getLevel().StartTime.Value, "unix")) /
                    storage.getSectorsClosedNumber());

    if (sec_speed <= 0) return "";

    return storage.getSectorsClosedNumber() > 0
      ? chrome.i18n.getMessage("sectorsSpeed", [ENEXT.convertTime(sec_speed)])
      : ""
  }

  initialize(storage){

    $("div.content")
      .append(storage.isStormGame() ? "" : this._titleTemplate(storage.getGame()))
      .append(storage.isStormGame() ? "" : $("<div>").addClass("spacer"))
      .append(this._timeoutTemplate(storage, storage.getLevel()))
      .append(this._sectorsTitleTemplate(storage, storage.getLevel()))
      .append(this._sectorsTemplate(storage.getLevel()))
      .append((storage.getSectorNumber() < 2) ? "" : $("<div>").addClass("spacer"))
      .append(this._taskTemplate(storage.getLevel()));

    this.task = storage.getTaskText();
    this.title = `${storage.getLevelNumber()}/${storage.getLevelCount()}`;
  }

  update(storage){

    var start_ts = ENEXT.convertTimestamp(storage.getLevel().StartTime.Value, "unix");
    var curr_ts = ENEXT.currentTimestamp();

    // Update task header
    if (
      this._titleUpdated(storage.getLevelNumber(), storage.getLevelCount())
    ){
      $("div.level-length")
        .replaceWith(this._titleTemplate(storage.getGame()));
    }


    // if (storage.isLevelUp() && !storage.getTimeoutSecondsRemain()) {

    if (storage.isLevelUp()) {
      $("#timeout-block")
        .replaceWith(this._timeoutTemplate(storage.getLevel()));
    } else  if (storage.getTimeoutSecondsRemain() == 0) {
        $("#timeout-block .countdown-timer.forward")
          .attr("seconds-left", ENEXT.currentTimestamp('local') -
          ENEXT.convertTimestamp(storage.getStartTime(), 'unix'));
    } else if (storage.getTimeoutSecondsRemain() > 0){
      $("#timeout-block .countdown-timer.backward")
        .attr("seconds-left", storage.getTimeoutSecondsRemain());
        $("#timeout-block .countdown-timer.forward")
          .attr("seconds-left", storage.getTimeout() -
          storage.getTimeoutSecondsRemain());
    }

    // Update timeout data
    // if (storage.getTimeoutSecondsRemain() > 0){
    //   $("#timeout-block .countdown-timer.backward")
    //     .attr("seconds-left", storage.getTimeoutSecondsRemain());
    //   $("#timeout-block .countdown-timer.forward")
    //     .attr("seconds-left", storage.getTimeout() - storage.getTimeoutSecondsRemain());
    // } else if (storage.isLevelUp() && !storage.getTimeoutSecondsRemain()) {
    //   $("#timeout-block")
    //     .replaceWith(this._timeoutTemplate(storage.getLevel()));
    // }

    if (storage.getTimeoutSecondsRemain() > 0){
      $("#timeout-block .countdown-timer.backward")
        .attr("seconds-left", storage.getTimeoutSecondsRemain() + 1);
      $("#timeout-block .countdown-timer.forward")
        .attr("seconds-left", storage.getTimeout() - storage.getTimeoutSecondsRemain() - 1);
    } else if (storage.isLevelUp() && !storage.getTimeoutSecondsRemain()) {
      $("#timeout-block")
        .replaceWith(this._timeoutTemplate(storage.getLevel()));
    } else if (storage.getTimeoutSecondsRemain() == 0) {
        $("#timeout-block .countdown-timer.forward")
          .attr("seconds-left", ENEXT.currentTimestamp('local') -
          ENEXT.convertTimestamp(storage.getStartTime(), 'unix'));
    }



    // Update sectors header
    if (storage.getSectorNumber() > 1){
      $("#sectors-total").html(storage.getSectorNumber());
      $("#sectors-left").html(storage.getSectorsLeft());
      $("#sectors-left-list").html(
        this._openSectorList(storage.getSectors())
      );
      $("#sectors-speed").html(this._sectorsClosingSpeed(storage));

      if (isOptionTrue(`${storage.getGameId()}-hide-disclosed-sectors`)){
        $("#sectors-left-list-block").hide();
      } else {
        $("#sectors-left-list-block").show();
      }
    }

    // Update sectors
    $(".sector-block").attr("delete-mark", "true");
    storage.getSectors().forEach(
      function(sector, ind){
        if (this.storage.isSectorNew(sector.SectorId)){
          $("div#sectors").append(this._sectorTemplate(sector));
        } else if (this.storage.isSectorChanged(sector.SectorId)) {
          $(`#sector-${sector.SectorId}`)
            .replaceWith(this._sectorTemplate(sector));
        }

        $(`#sector-${sector.SectorId}`).attr("delete-mark", false);
      },
      this
    );
    $(".sector-block[delete-mark=true]").remove();
    if (storage.getSectors().length > 10){
      $("#sectors").addClass("sectors-column");
    } else {
      $("#sectors").removeClass("sectors-column");
    }

    // Update task text
    if (storage.getTaskText() != this.task){
      $("#task").replaceWith(this._taskTemplate(storage.getLevel()));
    }
  }

  _titleTemplate(game){
    return $("<div>").addClass("level-length")
      .append(
        $("<h2> content")
        .append(chrome.i18n.getMessage(
          "levelTitle",
          [
            game.Level.Number,
            game.Levels.length,
            game.Level.Name != "" ? `: ${game.Level.Name}`: ""
          ])
        )
      );
            // // level start time
            // .append(
            //   $("<span>").addClass("color_dis").css("white-space", "nowrap")
            //   .append(chrome.i18n.getMessage("levelStart", [ENEXT.convertTimestamp(level.StartTime.Value, 'readable')]))
            // )

          // // level timeout
          // .append(
          //   $("<li>").addClass("color_sec")
          //   .append(
          //     game.Level.Timeout > 0
          //       ? chrome.i18n.getMessage("levelDuration", [ENEXT.convertTime(game.Level.Timeout)])
          //       : chrome.i18n.getMessage("levelInfinite")
          //   )
          // )
        // .append($("<div>").addClass("spacer"));
  }

  _timeoutTemplate(level){

    // if (level.IsPassed) return "";
    if (level.TimeoutSecondsRemain == 0) return "";

    // level duration if timeout is set
    return $("<h3>")
      .addClass("timer")
      .attr("id", "timeout-block")
      .append(chrome.i18n.getMessage("levelAutoUp"))
      .append(
        $("<span>")
          .addClass("countdown-timer backward")
          .attr("seconds-left", level.TimeoutSecondsRemain + 1)
          .append(ENEXT.convertTime(level.TimeoutSecondsRemain + 1, 'timer'))
      )
      .append(" ")
      .append(
        level.TimeoutAward != 0
          ? chrome.i18n.getMessage("levelAutoUpPenalty", [ENEXT.convertTime(-1*level.TimeoutAward)])
          : chrome.i18n.getMessage("levelAutoUpNoPenalty")
      )
      .append($("<div>").addClass("spacer"));
  }

  _sectorsTitleTemplate(storage, level){
    if (level.Sectors.length < 2) return ""; // do not show if there's only one sector

    // toggle not closed sectors
    $(function() {
      $('.toggle_disclosedSectors').on('click', function() {

        localStorage.setItem(
          `${storage.getGameId()}-hide-disclosed-sectors`,
          !isOptionTrue(`${storage.getGameId()}-hide-disclosed-sectors`)
        );

        $('.disclosed_sectors').toggle();
        if (isOptionTrue(`${storage.getGameId()}-hide-disclosed-sectors`)) $("#sectors-left-list-block").hide();
        else $("#sectors-left-list-block").show();

        // gameStorage.update();
        return false;
      });
    });

    return $("<div>")
    .append(
      $("<h3>")
      .append(
        chrome.i18n.getMessage(
          "sectorsCount",
          [
            level.Sectors.length,
            this.storage.getSectorsToClose(),
            level.SectorsLeftToClose,
            // Code closing speed
            this._sectorsClosingSpeed(this.storage)
          ]
        )
      )

      // toggle link
      .append("&nbsp;&nbsp;")
      .append(
        $("<a>").addClass("dashed options toggle_disclosedSectors")
        .append(chrome.i18n.getMessage("sectorsToggle"))
      )

      // toggle Block
      .append(
        $("<div>").addClass('disclosed_sectors').css("font-weight", "normal")
          .attr("id", "sectors-left-list-block")
          .append(chrome.i18n.getMessage("sectorsDisclosed",[this._openSectorList(level.Sectors)]))
        )
    );

  }

  _sectorsTemplate(level){
    return $("<div>")
      .attr("id", "sectors")
  }

  _completeSectorTemplate(sector){
    return $("<span>")
      .addClass("color_correct")
      .append(sector.Answer.Answer)
      .append("&nbsp;")
      .append(
        $("<span>")
          .addClass("color_sec")
          .append("(")
          .append(ENEXT.convertTimestamp(sector.Answer.AnswerDateTime.Value, 'encounter'))
          .append("&nbsp;")
          .append(
            $("<a>")
              .attr("href", `/userdetails.aspx?uid=${sector.Answer.UserId}`)
              .attr("target", "_blank")
              .append(sector.Answer.Login)
          )
          .append(")")
      );
  }

  _incompleteSectorTemplate(sector){
    return $("<span>")
      .addClass("color_dis")
      .append(chrome.i18n.getMessage("sectorDisclosed"));
  }

  _sectorTemplate(sector){
    return $("<p>")
      .addClass("sector-block")
      .attr("id", `sector-${sector.SectorId}`)
      .attr("id-numeric", sector.SectorId)
      .attr("delete-mark", false)
      .append(`${sector.Name}: `)
      .append(
        sector.IsAnswered
          ? this._completeSectorTemplate(sector)
          : this._incompleteSectorTemplate(sector)
      );
  }

  _taskTemplate(level){
    var result = $("<div>")
      .attr("id", "task")
      .append(encx_tpl.documentWriteOverride("#task p"));
    if (level.Tasks.length == 0) return result;

    return result
      .append(
        $("<div>")
        .append(
          $("<h3>").append(chrome.i18n.getMessage("titleTask"))
        )
      )
      .append(`<p>${level.Tasks[0].TaskTextFormatted}</p>`)
      .append($("<div>").addClass("spacer"))
      .append(encx_tpl.documentWriteRollback());
  }
}
