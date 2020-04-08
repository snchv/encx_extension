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

class GamePrepare extends GameManager {
  constructor (){
    super();

    $("body").addClass(
      /firefox/.test(navigator.userAgent.toLowerCase())
        ? "ff"
        : "gc"
    );

    // Prepare game menu
    // $(".header li.mail").remove();

    $(".header li.discuss a").attr("target", "_blank"); // open in new tab

    // Show level stat in dialog
    $(".levelstats a").click($.proxy(this.showLevelStat, this));

    // Open link to announce in new tab
    $("a#lblGameTitle").attr("target", "_blank");

    // Replace Encounter logo
    // $("a.logo").attr("target", "_blank");

    // this.userUpdateTime = 0;

    $(".header")
      .append(encx_tpl.documentWritePrepare());
  }


  initialize(storage) {
    if (storage.isFirstLoad()){
      $(".enext-block").remove();

      // prepare history dialog
      $(".header ul")
        .before(
          this._gameHistoryDialogTemplate()
        );

      this._prepareHistoryDialog();

      // Add bonuses and penalty button
      // $(".header ul .enext-bonuses").remove();
      // $(".header ul")
      //   .append(
      //     $("<li>")
      //       .addClass("enext-bonuses")
      //       .append(
      //         $("<a>")
      //           .append($("<i>"))
      //           .append(
      //             $("<span>").append(chrome.i18n.getMessage("menuBonuses"))
      //           )
      //           .attr("href", storage.getBonusesURL())
      //           .attr("target", "_blank")
      //       )
      //   );
    }

    $("div.container")
    .append(this._infoBlock(storage, storage.getGame(), storage.getLevel()));

    $("div.content").empty();
    // console.log( document.body.clientHeight / Number.parseFloat(+/\d+.\d/.exec($('#ChatFrame').attr('style'))) );
  }

  update (storage) {
    // Restart
    chrome.storage.local.get(
      "deniedDomains",
      function (result){
        if ((result.deniedDomains || "").split("|").includes(location.hostname)){
          location.reload();
        }
      }
    );

    if (storage.isLevelUpMessageTime()){
      this.playSound("audio/levelup.mp3");
    }

    isOptionTruePromise(`${this.storage.getGameId()}-enext-bar-bottom`).then(
      () => { $('#ChatFrame').css("height", `${(document.body.clientHeight-75-12-45-15-12)/2.25 - 48}px`);
              $(".enext-block").addClass("enext-block-bottom"); // add class for bottom position
            },
      () => { $(".enext-block").removeClass("enext-block-bottom"); }
    );

    // isOptionTruePromise(`${this.storage.getGameId()}-disable-chat`).then(
    //   () => { $('#ChatForm, #ChatFrame').hide(); },
    //   () => { $('#ChatForm, #ChatFrame').show(); }
    // );

    isOptionTruePromise(`${this.storage.getGameId()}-disable-chat`).then(
      () => { $('#ChatForm').hide(); },
      () => { $('#ChatForm').show(); }
    );
  }

  showLevelStat(event){
    event.preventDefault();

    $("<div>")
      .attr("id", "level-stat-dialog")
      .attr("title", chrome.i18n.getMessage("levelStatTitle"))
      .append(
        $("<iframe>")
          .attr("src", this.storage.getLevelStatURL())
          .attr("frameborder", 0)
          .attr("marginwidth", 0)
          .attr("marginheight", 0)
      )
      .dialog({
        autoOpen: true,
        modal: false,
        width: 700,
        height: 420,
        close: function (){
          $(".levelstats div#level-stat-dialog").remove();
        }
      });
  }

  _infoBlock(storage, game, level) {
    // toggle user info
    $(function() {
      $('.toggle_userdetails').click(function() {

        if ($(this).hasClass('click1')) {
          $("ul.userdetails").toggle();
        }

        else {
          $.get(
            storage.getMyTeamURL(),
            function(result){
              var userinfo = $(result).find("#tblUserBox tr:first td:first a[href='/UserDetails.aspx']");
              var teaminfo = $(result).find("a#lnkTeamName");

              if (0 === teaminfo.length){
                teaminfo = [ encx_tpl.singleTeamLink(storage.getMyTeamURL()) ];
              }

              // var mailinfo = $(result).find("#spanUnreadMails");
              // $(mailinfo[0]).show();
              // if ($(mailinfo[0]).find("a").text() === ""){
              //   $(mailinfo[0]).find("a").text("0");
              // }

              $("ul.userdetails").remove();
              $(".enext-block")
              .append(
                $("<ul>").addClass("userdetails")
                .append(chrome.i18n.getMessage('titleUserLogin'))
                .append(userinfo[0])
                .append("  |  ")
                .append(chrome.i18n.getMessage('titleUserTeam'))
                .append(teaminfo[0])
              )
            }
          );

          // this.userUpdateTime = Date.now();
        }

        $(this).toggleClass('click1');

        return false;

      });
    });

    $(".enext-block").remove();

    return $("<div>").addClass("enext-block")
     .append(
      $("<ul>")
      // TODO search script in text
      .append(this._levelScriptsAlert(storage, level))

      .append($("<li>").addClass("enext-level-timer")
      .append(this._levelTimer(level)
        )
      )

      .append($("<li>").addClass("enext-level-duration")
      .append(this._levelDuration(level)
        )
      )

      .append($("<li>").addClass("enext-bonuses-summary")
      .append(this._levelBonusesSummary()
        )
      )

      .append(
        $("<li>").addClass("enext-history")
        .append(
          $("<span>")
          .append(
            $("<a>")
            .append(chrome.i18n.getMessage('menuHistory'))
            .click(
              {
                gamePrepare: this,
                storage: storage
              },
              this.showGameHistory
            )
          )
          .before(
            this._gameHistoryDialogTemplate()
          )
        )
      )

      .append(
        $("<li>").addClass("enext-bonuses")
        .append(
          $("<a>")
            .append($("<i>"))
            .append(
              $("<span>").append(chrome.i18n.getMessage("menuBonuses"))
            )
            .attr("href", storage.getBonusesURL())
            .attr("target", "_blank")
        )
      )

      .append(
        $("<li>").addClass("enext-userdetails")
        .append(
          $("<a>").addClass ('dashed toggle_userdetails')
           .append(chrome.i18n.getMessage('titleUserInfo'))
        )
      )
    );
  }

  _levelScriptsAlert(storage, level) {
    if (level.IsPassed) return "";

    if ( storage.getTaskText().includes('</script>') )
    return $("<li>").addClass("enext-alert")
            .append(
              $("<span>").addClass("alerts")
              .attr('title', chrome.i18n.getMessage('levelContainsScript'))
              .append("⚠️")
            );

    return "";
  }

  _levelTimer(level) {
    // message if level is passed
    if (level.IsPassed)
      return $("<span>").append(chrome.i18n.getMessage("levelIsPassed"));

    // timer if level have no timeout
    if (level.TimeoutSecondsRemain == 0) {
      return $("<span>")
      .attr("title",
        chrome.i18n.getMessage("levelStart",
        [ENEXT.convertTimestamp(level.StartTime.Value, 'readable')] + " " +
        [ENEXT.currentTimestamp('offset')]) + "\n" +
        chrome.i18n.getMessage("currentTime",
        [ENEXT.currentTimestamp('readable')] + " " +
        [ENEXT.currentTimestamp('offset')])
      )
      .append(chrome.i18n.getMessage("levelOnLevelTime"))
      .append(
        $("<span>").addClass("countdown-timer forward")
        .attr("seconds-left", ENEXT.currentTimestamp('local') - ENEXT.convertTimestamp(level.StartTime.Value, 'unix'))
        .attr("seconds-step", +1 )
        .append(ENEXT.convertTime(ENEXT.currentTimestamp('local') - ENEXT.convertTimestamp(level.StartTime.Value, 'unix'), 'timer'))
      );
    }

      // timer if level timeout is set
      return $("<span>")
      .append(chrome.i18n.getMessage("levelOnLevelTime"))
      .append(
        $("<span>")
        .attr("title",
          chrome.i18n.getMessage("levelStart",
          [ENEXT.convertTimestamp(level.StartTime.Value, 'readable')] + " " +
          [ENEXT.currentTimestamp('offset')]) + "\n" +
          chrome.i18n.getMessage("currentTime",
          [ENEXT.currentTimestamp('readable')] + " " +
          [ENEXT.currentTimestamp('offset')])
        )
          .addClass("countdown-timer forward")
          .attr("seconds-left", level.Timeout - level.TimeoutSecondsRemain - 1 )
          .attr("seconds-step", +1)
          .append(ENEXT.convertTime(level.Timeout - level.TimeoutSecondsRemain - 1, 'timer'))
      );
    }

  _levelDuration(level) {
    if (level.Timeout > 0) return $("<span>").css('color', '#FFF720 !important')
      .append(chrome.i18n.getMessage("levelDuration", [ENEXT.convertTime(level.Timeout)]));

    return $("<span>").css('color', '#FFF720 !important')
      .append(chrome.i18n.getMessage("levelInfinite"));
  }

  _levelBonusesSummary() {
    if (this.storage.getBonuses().length == 0)
      return $("<span>").addClass("color_bonus")
             .append(chrome.i18n.getMessage("bonusFreeBlockTitle"));

    return $("<span>").addClass("color_bonus")
      .append(
        chrome.i18n.getMessage(
          "bonusBlockTitle",
          [
            this.storage.getCompletedBonusesData()[0],
            this.storage.getBonuses().length,
            this.storage.getCompletedBonusesData()[1],
          ]
        )
      );
  }

  _historyLevelList(){
    var result = [];
    this.storage.getLevels().forEach(function(element){
      result.push(`<option value="${element.LevelId}">${element.LevelNumber}: ${element.LevelName}</option>`);
    });
    console.log(result);
    return result.join("\n");
  }

  _gameHistoryDialogTemplate(){
    return `
    <div class="game-history-box" id="game-history-dialog" title="${chrome.i18n.getMessage("optionsGameHistoryDialog")}">
      <textarea id="game-history-download-csv"></textarea>
      <table>
        <tr>
          <td>
            ${chrome.i18n.getMessage("titleLevel")}:
            <select id="game-history-level"></select>
          </td>
          <td class="alignedRight">
            ${chrome.i18n.getMessage("titlePlayer")}:
            <select id="game-history-player"></select>
          </td>
        </tr>
        <tr>
          <td colspan=2>
            <input id="game-history-filter" placeholder="${chrome.i18n.getMessage("optionsGameHistoryDialog_partOfCode")}">
          </td>
        </tr>
        <tr>
          <td colspan=2 class="codes history"><ul id="game-history-codes"></ul></td>
        </tr>
      </table>
    </div>
    `;
  }

  _fillHistoryForm(e){
    if (e.type === "click"){
      // Prepare level list
      $("#game-history-level option").remove();
      $("#game-history-level").append(
        `<option value="All">${chrome.i18n.getMessage("titleAny")}</option>`
      );
      e.data.storage.getLevels().forEach(function (level){
        $("#game-history-level")
        .append(
          `<option value="${level.LevelId}">${level.LevelNumber}: ${level.LevelName}
</option>`);
      });
      $("#game-history-level").val(e.data.storage.getLevel().LevelId);

      $("#game-history-filter").val("");
    }

    if (e.target.id !== "game-history-player"){
      // Prepare player list
      $("#game-history-player option").remove();
      $("#game-history-player").append(
        `<option value="All">${chrome.i18n.getMessage("titleAny")}</option>`
      );
      localDB.openIndexedDB().then((openDB) => {
        var db = localDB.getStoreIndexedDB(openDB);
        var levels = $("#game-history-level").val() === "All"
          ? e.data.storage.getLevelIds()
          : [parseInt($("#game-history-level").val())];
        var added = [];
        db.store.index("UserId").openCursor(null, "next").onsuccess = function(event){
          var cursor = event.target.result;
          if (cursor){
            if (
              levels.includes(cursor.value.LevelId) &&
              !added.includes(cursor.key)
              /*
              Prevent adding same name twice
              Cannot use "nextunique" as record LevelId can be from another game
              */
            ){
              $("#game-history-player").append(
                `<option value="${cursor.key}">${cursor.value.Login}</option>`
              );
              added.push(cursor.key);
            }
            cursor.continue();
          }
        }
      });
    }

    localDB.openIndexedDB().then((codeDB) => {
      var db = localDB.getStoreIndexedDB(codeDB);
      var levels = $("#game-history-level").val() === "All"
        ? e.data.storage.getLevelIds()
        : [parseInt($("#game-history-level").val())];
      $("#game-history-codes li").remove();

      // Create CSV header
      $("#game-history-download-csv").text("LevelNumber,Login,Time,Type,Answer,IsCorrect\n");

      db.store.openCursor().onsuccess = function(event){
        var cursor = event.target.result;
        if (cursor){
          if (
            // Level from this game or single selected
            levels.includes(cursor.value.LevelId) &&
            // Player, who sent some codes or single selected
            (
              $("#game-history-player").val() === "All" ||
              parseInt($("#game-history-player").val()) === cursor.value.UserId
            ) &&
            // Code starts with given string
            cursor.value.Answer.toLowerCase().startsWith(
              $("#game-history-filter").val().toLowerCase()
            )
          ){
            // Put code to form list
            $("#game-history-codes").append(
              encx_tpl.historicActionTemplate(cursor.value)
            );

            // Put code to csv
            $("#game-history-download-csv").text(
              $("#game-history-download-csv").text() +
              `"${cursor.value.LevelNumber}","${cursor.value.Login}","${cursor.value.LocDateTime}","${cursor.value.Kind == 2 ? 'Bonus' : 'Code'}","${cursor.value.Answer}","${cursor.value.IsCorrect}"\n`
            );
          }
          cursor.continue();
        } else {
          // Scroll to top of history list
          $("#game-history-codes").scrollTop(0);
        }
      }
    });
  }

  _prepareHistoryDialog(){

    $("#game-history-dialog").dialog({
        autoOpen: false,
        buttons: [
          {
            text: chrome.i18n.getMessage("buttonCopyLevelList"),
            click: () => {
              var result = [];

              this.storage.getLevels().forEach(function (level){
                result.push(`${level.LevelNumber}: ${level.LevelName}`);
              });

              var $tmp = $("<textarea>");
              $("body").append($tmp);
              $tmp.val( result.join("\n") ).select();
              document.execCommand("copy");
              $tmp.remove();
            }
          },
          {
            text: chrome.i18n.getMessage("buttonDownload"),
            click: this.gameHistoryDialogDownload
          },
          {
            text: chrome.i18n.getMessage("buttonOk"),
            click: this.gameHistoryDialogClose
          }
        ],
        width: 'auto',
        // resizable: false,
        position: {
          at: 'top'
        },
        close: this.gameHistoryDialogClose
    });

    $("#game-history-level").change(
      { storage: this.storage },
      this._fillHistoryForm
    );
    $("#game-history-player").change(
      { storage: this.storage },
      this._fillHistoryForm
    );
    $("#game-history-filter").keyup(
      { storage: this.storage },
      this._fillHistoryForm
    );
  }

  gameHistoryDialogClose(e){
    $("#game-history-dialog").dialog("close");
  }

  gameHistoryDialogDownload(e){
    var element = document.createElement('a');

    element.setAttribute(
      'href',
      URL.createObjectURL(
        new Blob(
          [$("#game-history-download-csv").text()],
          {type: "text/csv"}
        )
      )
    );
    element.setAttribute('download', 'game_monitoring.csv');

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
  }

  showGameHistory(e){
    e.data.gamePrepare._fillHistoryForm(e);

    $("#game-history-dialog").dialog("open");
  }
}
