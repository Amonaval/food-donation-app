import React, {Component} from 'react';

class AboutUs extends Component {
  state = {
  };

  render() {
      return (
          <section className="section aboutus">
              <div className="container">
                  <div className="aboutus-title">Feed the Need - NGO free distributed & scalable food donation system</div>
                  <div>
                      <p> Every person feels to feed the hunger, more specifically in difficult times like covid-19 & more happily if they are assured that its been reaching the need. </p>
                      <br/>
                      <p>Having NGO as centralized system of donation is not scalable, reachable & feasible at every place.</p>
                      <br/>
                      <p>Idea is to have decentralized food donation.</p>
                      <br/>
                      <p><b>I want to donate</b> - 
                            Individual wants to donate food on specific date of specific quantity. 
                            Person can look for food needs around his/her area. Can confirm the request.
                            He may also initiate donation request voluntarily</p>
                      <br/>
                      <p><b>NEEDY </b>- Person is in need of food for specific date & time. 
                      Person can raise food needs request or can confirm matching request around his/her area if any.</p>
                     
                      HELPING HAND can raise request as needy on behalf of poor who are being noticed by HELPING HAND person/group. 
                      Poor might not be using the app so HELPING HAND would be the one who would be collecting the food from PROVIDER & 
                      will provide the food to NEEDY.
                      (E.g Some NGO group/person, voluteers etc)

                     
                      <br/>
                      <p><b></b> </p>
                      <hr></hr>
                      {/* <p><b>BUSINESS VALUE</b> -- This idea itself can be considered as prototype implementation of business sceanrio. 
                        Many scenarios can use this underlying model.
                        <div>Food is the transactional entity which can be replaced with any other business entity</div>
                      </p> */}
                  </div>
              </div>
          </section>
      );
  }
}

export default AboutUs;