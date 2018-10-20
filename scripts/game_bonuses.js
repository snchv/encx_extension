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
    this.storage = storage;
    $("div.content").append("<div id='bonuses'></div>");
  }

  update(storage){
    $(".bonus-block").attr("delete-mark", true);
    storage.getBonuses().forEach(
      function(bonus){
        if (this.storage.isBonusNew(bonus.BonusId)){
          $("div#bonuses").append(this._bonusTemplate(bonus));
        } else if (this.storage.isBonusChanged(bonus.BonusId)){
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
    $("li.enext-bonuses")
      .attr(
        "title",
        chrome.i18n.getMessage(
          "bonusesClosedSummary",
          storage.getCompletedBonusesData()
        )
      )
      .tooltip();

    var hideBonuses = ENEXT.parseBoolean(localStorage.getItem(
      `${this.storage.getGameId()}-hide-complete-bonuses`
    ));
    hideBonuses ? $(".bonus-answered").hide() : $(".bonus-answered").show();

    var showBonusTask = ENEXT.parseBoolean(localStorage.getItem(
      `${this.storage.getGameId()}-show-complete-bonus-task`
    ));
    showBonusTask ? $(".bonus-answered .bonus-task").show() : $(".bonus-answered .bonus-task").hide();

    var showBonusCode = ENEXT.parseBoolean(localStorage.getItem(
      `${this.storage.getGameId()}-show-complete-bonus-code`
    ));
    showBonusCode ? $(".bonus-answered .bonus-code").show() : $(".bonus-answered .bonus-code").hide();
  }

  _bonusInfoTemplate(bonus){
    return $("<span>")
      .addClass("color_sec")
      .append(`(${ENEXT.convertTimestamp(bonus.Answer.AnswerDateTime.Value)} `)
      .append(
        $("<a>")
          .attr("href", `/userdetails.aspx?uid=${bonus.Answer.UserId}`)
          .attr("target", "_blank")
          .append(bonus.Answer.Login)
      )
      .append(chrome.i18n.getMessage("bonusReward"))
      .append(
        ENEXT.convertTime(bonus.AwardTime)
      )
      .append(")");
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

  _bonusOpenTemplate(bonus){
    return $("<div>")
      .addClass("bonus")
      .append(encx_tpl.documentWriteOverride(`#bonus-${bonus.BonusId} .bonus-hint`))
      .append(
        $("<div>")
          .addClass("bonus-hint")
          .attr("id", `bonus-${bonus.BonusId}-hint`)
          .append((bonus.Help || '').replace(/\r\n/g, "<br>"))
      )
      .append(encx_tpl.documentWriteOverride(`#bonus-${bonus.BonusId} .bonus-task`))
      .append(
        $("<div>")
          .addClass("bonus-task")
          .attr("id", `bonus-${bonus.BonusId}-task`)
          .append(bonus.Task)
      )
      .append(encx_tpl.documentWriteOverride(`#bonus-${bonus.BonusId} .bonus-code`))
      .append(
        $("<div>")
          .addClass("bonus-code")
          .attr("id", `bonus-${bonus.BonusId}-code`)
          .append(bonus.Answer.Answer)
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
          .append(bonus.Task)
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
            ? chrome.i18n.getMessage(
                "bonusNumberName",
                [bonus.Number, bonus.Name]
              )
            : chrome.i18n.getMessage(
                "bonusNumber",
                [bonus.Number]
              )
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
                .append(")")
            : ""
          )
          .append(
            bonus.IsAnswered
              ? $("<span>")
                  .addClass("color_sec")
                  .append(this._bonusInfoTemplate(bonus))
              : ""
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
