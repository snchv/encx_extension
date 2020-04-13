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

class GameBonusManager extends GameManager {
  initialize(storage){
    $("div.content")
    .append("<div id='bonuses'></div>");
  }

  update(storage){

    this.hideBonuses = isOptionTrue(`${this.storage.getGameId()}-hide-complete-bonuses`);
    this.showBonusTask = isOptionTrue(`${this.storage.getGameId()}-show-complete-bonus-task`);
    this.showBonusCode = isOptionTrue(`${this.storage.getGameId()}-show-complete-bonus-code`);

    $(".bonus-block").attr("delete-mark", true);
    storage.getBonuses().forEach(
      function(bonus){
        if (this.storage.isBonusNew(bonus.BonusId)){
          $("div#bonuses").append(this._bonusTemplate(bonus));
        } else if (
          this.storage.isBonusChanged(bonus.BonusId) ||
          $(`div#bonus-${bonus.BonusId}`).attr("update-mark")
        ){
          $(`div#bonus-${bonus.BonusId}`)
            .replaceWith(this._bonusTemplate(bonus));
        }

        $(`#bonus-${bonus.BonusId}`).attr("delete-mark", false);
        $(`#bonus-${bonus.BonusId} .tabs`).tabs();

        $(`#bonus-${bonus.BonusId}.bonus-waiting .countdown-timer`)
          .attr("seconds-left", bonus.SecondsToStart);
        $(`#bonus-${bonus.BonusId} .bonus-countdown .countdown-timer`)
          .attr("seconds-left", bonus.SecondsLeft);
      },
      this
    );
    $(".bonus-block[delete-mark=true]").remove();

    // Bonuses on current level summary
    // $("li.enext-bonuses")
    //   .attr(
    //     "title",
    //     chrome.i18n.getMessage(
    //       "bonusesClosedSummary",
    //       storage.getCompletedBonusesData()
    //     )
    //   )
    //   .tooltip();

    // Adjust iframe sizes (+10 to resize frame after the contents are modified)
    $("div#bonuses iframe").each(
      function(ind, frame){
        frame.onload = function(){
          this.height = this.contentWindow.document.body.scrollHeight + 10;
          this.width = this.contentWindow.document.body.scrollWidth + 10;
        }
      }
    );

    this.hideBonuses ? $(".bonus-answered").hide() : $(".bonus-answered").show();


    // update bonus summary info
    if (storage.getBonuses().length > 0) {
      $("#bonuses-closed").html(storage.getCompletedBonusesData()[0]);
      $("#bonuses-closed-hidden").html(storage.getCompletedBonusesData()[0]);
      $("#bonuses-total").html(storage.getBonuses().length);
      $("#bonus-time").html(storage.getCompletedBonusesData()[1]);
    }

  }

  _bonusInfoTemplate(bonus){
    return $("<span>")
      .addClass("color_sec")
      .append(" (")
      .append(`${ENEXT.convertTimestamp(bonus.Answer.AnswerDateTime.Value, 'encounter')} `)
      .append(
        $("<a>")
          .attr("href", `/userdetails.aspx?uid=${bonus.Answer.UserId}`)
          .attr("target", "_blank")
          .append(bonus.Answer.Login)
      )
      .append(chrome.i18n.getMessage("bonusReward"))
      .append( ENEXT.convertTime(bonus.AwardTime) + ", ")
      .append(
        $("<span>").addClass("color_bonus")
        .append(bonus.Answer.Answer)
	    )
      .append(") ");
  }

  _tabHeaderTemplate(title, href){
    return $("<li>")
      .append(
        $("<a>")
          .attr("href", href)
          .append(title)
      );
  }

  _tabBodyTemplate(id, text, clas=''){
    return $("<div>")
      .attr("id", id)
      .append(
        $("<p>")
          .addClass(clas)
          .append(text)
      )
  }

  _bonusOpenTaskTemplate(bonus){
    $(function() {
      $(`#bonus-${bonus.BonusId}-toggle`).on('click', function() {

        if ($(this).hasClass('click1')) {
          $(`#bonus-${bonus.BonusId}-task`).toggle(200);
          $(`#bonus-${bonus.BonusId}-task`).remove();

        } else {
          $(`#bonus-${bonus.BonusId} h3:first`)
          .after(
            $("<div>")
            .addClass("bonus-task").css('display', 'none')
            .attr("id", `bonus-${bonus.BonusId}-task`)
            .append(encx_tpl.iframeSandbox((bonus.Task || '').replace(/\r\n/g, "<br>")))
          );
          $(`div#bonus-${bonus.BonusId} iframe`).each(
            function(ind, frame){
              frame.onload = function(){
                this.height = this.contentWindow.document.body.scrollHeight + 10;
                this.width = this.contentWindow.document.body.scrollWidth + 10;
              }
            }
          );
          $(`#bonus-${bonus.BonusId}-task`).toggle(200);
        }

        $(this).toggleClass('click1');
        return false;

      });
    });

    return $("<div>")
    .append(encx_tpl.documentWriteOverride(`#bonus-${bonus.BonusId} .bonus-task`))
    .append(
      (this.showBonusTask && (bonus.Task || '').length > 0)
        ? $("<div>")
            .addClass("bonus-task")
            .attr("id", `bonus-${bonus.BonusId}-task`)
            .append(encx_tpl.iframeSandbox((bonus.Task || '').replace(/\r\n/g, "<br>")))
        : ''
    );
  }

  _bonusOpenTemplate(bonus){
    return $("<div>")
      .addClass("bonus")
      .append(this._bonusOpenTaskTemplate(bonus))

      // .append(encx_tpl.documentWriteOverride(`#bonus-${bonus.BonusId} .bonus-task`))
      // .append(
      //   (this.showBonusTask && (bonus.Task || '').length > 0)
      //     ? $("<div>")
      //         .addClass("bonus-task")
      //         .attr("id", `bonus-${bonus.BonusId}-task`)
      //
      // // Bonus in sandbox
      //         .append(
      //           encx_tpl.iframeSandbox(
      //             (bonus.Task || '').replace(/\r\n/g, "<br>")
      //           )
      //         )
      //     : ''
      // )

      .append(encx_tpl.documentWriteOverride(`#bonus-${bonus.BonusId} .bonus-hint`))
      .append(
        $("<div>")
          .addClass("bonus-hint")
          .attr("id", `bonus-${bonus.BonusId}-hint`)
          .append((bonus.Help) ? (`<p>${bonus.Help}</p>`).replace(/\r\n/g, "<br>") : "")
        )
      .append(encx_tpl.documentWriteOverride(`#bonus-${bonus.BonusId} .bonus-code`))
      .append(
        this.showBonusCode
          ? $("<div>")
              .addClass("bonus-code")
              .attr("id", `bonus-${bonus.BonusId}-code`)
              .append(bonus.Answer.Answer)
          : ''
      );
  }

  _bonusClosedTemplate(bonus){
    return $("<div>")
      .addClass("bonus")
      .append(encx_tpl.documentWriteOverride(`#bonus-${bonus.BonusId} .bonus-task`))
      .append(
        $("<div>")
          .addClass("bonus-task")
          .attr("id", `bonus-${bonus.BonusId}-task`)
          .append((bonus.Task) ? (`<p>${bonus.Task}</p>`).replace(/\r\n/g, "<br>") : "")
      );
  }

  _bonusExpiredTemplate(bonus){
    return $("<div>")
      .addClass("bonus-block")
      .addClass("color_dis")
      .attr("id", `bonus-${bonus.BonusId}`)
      .attr("id-numeric", bonus.BonusId)
      .attr("delete-mark", false)
      .css("order", bonus.Number)
      .append(
        $("<b>").append(
          chrome.i18n.getMessage("bonusNumber", [bonus.Number])
        )
      )
      .append(
        chrome.i18n.getMessage("bonusExpiredMessage")
      )
      .append(
        $("<div>").addClass("spacer")
      )
  }

  _bonusWaitingTemplate(bonus){
    return $("<div>")
      .addClass("bonus-block color_dis bonus-waiting")
      .attr("id", `bonus-${bonus.BonusId}`)
      .attr("id-numeric", bonus.BonusId)
      .attr("delete-mark", false)
      .css("order", bonus.Number)
      .append(
        $("<b>").append(
          chrome.i18n.getMessage("bonusNumber", [bonus.Number])
        )
      )
      .append(this._timerTemplate(bonus.SecondsToStart))
  }

  _bonusTemplate(bonus){
    if (bonus.SecondsToStart > 0) return this._bonusWaitingTemplate(bonus);
    if (bonus.Expired == true) return this._bonusExpiredTemplate(bonus);
    return $("<div>")
      .addClass("bonus-block")
      .addClass(bonus.IsAnswered ? "bonus-answered" : "")
      .attr("id", `bonus-${bonus.BonusId}`)
      .attr("id-numeric", bonus.BonusId)
      .attr("delete-mark", false)
      .css("order", bonus.Number)
      .append(
        $("<h3>")
          .addClass(bonus.IsAnswered ? "color_correct" : "color_bonus")
          .append(
            bonus.Name != null
            ? `${chrome.i18n.getMessage(
                "bonusNumberName",
                [bonus.Number, bonus.Name]
              )}<wbr>`
            : `${chrome.i18n.getMessage(
                "bonusNumber",
                [bonus.Number]
              )}<wbr>`
          )
          .append(
            bonus.SecondsLeft > 0
            ? $("<span>")
                .addClass("color_sec bonus-countdown")
                .append(" (")
                .append(
                  this._timerTemplate(
                    bonus.SecondsLeft,
                    chrome.i18n.getMessage("timerLeft")
                  )
                )
                .append(") ")
            : ""
          )
          .append(
            bonus.IsAnswered
              // ? $("<span>")
              //     .addClass("color_sec")
              //     .append(this._bonusInfoTemplate(bonus))
              ? this._bonusInfoTemplate(bonus)
              : ""
          )
          .append ( () => {
            if (!this.showBonusTask && bonus.IsAnswered && bonus.Task) {
              return $("<a>").addClass("options dashed")
              .attr("id", `bonus-${bonus.BonusId}-toggle`)
              .append(chrome.i18n.getMessage("toggleClosedBonusTask"));
            }
            return "";
          }
          )
      )
      .append(
        bonus.IsAnswered
          ? this._bonusOpenTemplate(bonus)
          : this._bonusClosedTemplate(bonus)
      )
      .append(
        $("<div>").addClass("spacer")
      )
      .append(encx_tpl.documentWriteRollback());
  }
};
