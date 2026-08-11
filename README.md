# W8-Tracker
*Suckless weight tracking application for personal use. Fast, private and just plain awesome.*

## Goals :
* Make tracking personal body weight and BMI over long period a convenient chore.
  * Provide a simple interface for inserting, updating and deleting weights.
  * Save the data in a database for the long-term storage.
  * Supports both desktop and mobile use.
* Learn new technologies:
  * Low-level full-stack application.
  * Set up a RESTful application from scratch.
  * Deal with all the nitty-gritty details of the application, without the help of any frameworks.
  * Devops.

TODO:
- line should be average, not some approximation
- [ ] Trendline / records.
- candlestick chart?
- ## Style improvements and new features
- [ ] Point hover peaks joonistama x/y jooni
- [ ] Hoveril peaks kuvama tooltipi.
- [ ] Info button with project description in the header
- [ ] Guides:
  - [ ] claoric maintenance rate
  - [ ] protein intake
- [ ] If good score - https://www.kirilv.com/canvas-confetti/
- [ ] If bad... flames?
- [ ] Scaled labels. In mobile they don't fit.
- [ ] Ceck lighthouse scores
- [ ] Track performance
- 

## Structural changes
- [ ] Would love to have both online and a robust offline mode. Offline meaning if API is down, the page still gets served.
  - [ ] If offline or bad connectivity use a worker? to submit changes when the connectivity is restored? 
- [ ] Kasuta sesa 80 või 433 porti. Lihtsalt kui api on maas serveeritakse by default index html? Veidi teine struktuur
- [ ] Vb eraldada w8 old ja new, et vana jääks ülesse aga uut saaks ka arendada.

- [ ] Check/Update Github Issues
- [ ] Load fonts, then render the page.
- [ ] W8 axis can only show täisarv
- [ ] Use fieldset for nice looking inputs. Also refactor adding form, it's currently quite difficult to maintain.