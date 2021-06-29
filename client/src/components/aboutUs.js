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
                      <p> Every person feels to feed the hunger, more specifically in difficult times like covid & more happily if they are assured that its been reaching the need. </p>
                      
                      <p>Having NGO as centralized system of donation is not scalable, reachable & feasible at every place.</p>
                  
                      <p><b>Idea is to have decentralized food donation system.</b></p>
                      <br/>
                      <p><b>I want to donate </b> - 
                            Individual wants to donate food on specific date of specific quantity. 
                            Person can look for food needs around his/her area. Can confirm the request.
                            He may also initiate donation request voluntarily</p>
                      <br/>
                      <p><b>I am in need</b>- Person is in need of food for specific date & time. 
                      Person can raise food needs request or can confirm matching request around his/her area if any.</p>
                      <br/>
                     
                      <p><b>Helping hand</b>- can raise request as needy on behalf of poor who are being noticed by them as individual or NGO voluteers. 
                      Poor might not be using the app so these people would be the one who would be collecting the food from DONARS & will provide to needy working as mediator.</p>
                      
                      <br />
                            
                      <p><b>Peer to Peer</b> donation as</p>
                      <ul>
                          <li>Individual - Individual</li>
                          <li>NGO - Individual</li>
                          <li>NGO - NGO</li>
                          <li>Individual - NGO</li>
                      </ul>
                      <p>or any which ways possible you can contribute to a society</p>

                      {/*<hr></hr>
                      <p><b>BUSINESS VALUE</b> -- This idea itself can be considered as prototype implementation of business sceanrio. 
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