import React, {useState} from 'react';
import {useParams, useHistory} from 'react-router-dom';
import {Row, Col, Card, Button} from 'react-bootstrap';
import { useInterval } from '../utils/useInterval';
import './CarbonOffsetProjectDetail.scss'

const CarbonOffsetProjectDetail = () => {
    const [zipCode, setZipCode] = useState('94117');
    const { projectType } = useParams();

    const [avgUsage, setAvgUsage] = useState();
    
    useInterval(async () => {
        const response = await fetch(`/statements_average`);
        const data = await response.json();
        setAvgUsage(data);
    } , 1000);

    const history = useHistory();

    let offsetMessage = 'project that has the most beneficial impact';

    switch (projectType) {
        case 'affordable':
            offsetMessage = 'most affordable project available';
            break;
        case 'local':
            offsetMessage = 'project that most benefits your local community';
            break;
        case 'permanent':
            offsetMessage = 'project that will have the most lasting benefits';
            break;
        case 'rd':
            offsetMessage = 'project that will most effectively fuel technological advancement';
            break;
    }

    return (
        <div className="container">
            <Row className="justify-content-md-center">
                <Col xs={12} sm={6}>
                    <Button variant="outline-dark" onClick={() => history.push('/select')}>◀</Button>
                    <h3>Here’s the best carbon offset for you</h3>
                    <p>We’ve found the {offsetMessage} in your zip code ({zipCode}).</p>

                    <Card className="mb-3">
                        <Card.Img variant="top" src="https://dogtime.com/assets/uploads/2017/09/pit-bull-puppies-3-1280x720.jpg" />

                        <Card.Body>
                            <Card.Title>Project Name</Card.Title>
                            <Card.Text>
                                <Row className="g-0">
                                    <Col>Offset Location</Col>
                                    <Col className="text-end"><span className="text-success">$x</span> per tonne CO2</Col>
                                </Row>
                            </Card.Text>
                        </Card.Body>
                    </Card>

                    <Card className="mb-3">
                        <Card.Body>
                            <Card.Text>
                                <p>The electricity generated in your zip code ({zipCode}) is a mix of different fuel sources.</p>
                                <Row>
                                    <Col className="text-center">
                                        <p className="fs-1">x%</p>
                                        <p>renewable</p>
                                    </Col>
                                    <Col className="text-center">
                                        <p className="fs-1">x%</p>
                                        <p>nuclear</p>
                                    </Col>
                                    <Col className="text-center">
                                        <p className="fs-1">x%</p>
                                        <p>fossil fuel</p>
                                    </Col>
                                </Row>
                                <Row>
                                    {/* WE DON'T NEED NO STINKIN D3 */}
                                    <ul className="list-unstyled list-inline" style={{borderRadius:"10px"}}>
                                        <li className="list-inline-item me-0 rounded-start renewable" style={{backgroundColor:"#1B511F",width:"30%"}}>&nbsp;</li>
                                        <li className="list-inline-item me-0 nuclear" style={{backgroundColor:"#66ACFD",width:"10%"}}>&nbsp;</li>
                                        <li className="list-inline-item me-0 fossil rounded-end" style={{backgroundColor:"#6E7B84",width:"60%"}}>&nbsp;</li>
                                    </ul>
                                    <ul className="list-unstyled list-inline text-center">
                                        <li className="list-inline-item"><span className="legend wind" />Renewable</li>
                                        <li className="list-inline-item"><span className="legend nuclear" />Nuclear</li>
                                        <li className="list-inline-item"><span className="legend other" />Fossil fuel</li>
                                    </ul>
                                </Row>
                            </Card.Text>
                        </Card.Body>
                    </Card>

                    <Row className="mb-3">
                        <Col className="text-muted">
                        Your average kWh usage per month
                        </Col>
                        <Col className="text-end">
                            0000
                        </Col>
                    </Row>
                    <Row className="mb-3">
                        <Col className="text-muted">Average tonnes CO₂ emitted per kWh in {zipCode}</Col>
                        <Col className="text-end">
                            0000
                        </Col>
                    </Row>
                    <Row className="mb-3">
                        <Col className="text-muted">Average tonnes CO₂ you emit per month</Col>
                        <Col className="text-end">
                            0000
                        </Col>
                    </Row>
                    <Row className="mb-3">
                        <Col className="text-muted">Removal price per tonne CO₂</Col>
                        <Col className="text-end text-success">
                            0000
                        </Col>
                    </Row>
                    <Row className="text-primary">
                        <Col>Average monthly carbon removal subscription fee</Col>
                        <Col className="text-end">
                            0000
                        </Col>
                    </Row>

                    <div className="d-grid my-3">
                        <Button variant="dark">Subscribe for $x per month</Button>
                    </div>

                    <p className="text-muted">Note that this is an estimated fee. Your actual monthly fee will vary based on your electricity usage.</p>

                </Col>
            </Row>
        </div>
    )
}

export default CarbonOffsetProjectDetail;