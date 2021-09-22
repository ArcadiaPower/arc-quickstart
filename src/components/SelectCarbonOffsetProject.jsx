import {useState} from 'react';
import { useHistory } from 'react-router-dom';
import {Row, Col, Card, Button} from 'react-bootstrap';
import './SelectCarbonOffsetProject.scss';
import {ReactComponent as AffordableIcon} from '../img/affordable.svg';
import {ReactComponent as PermanentIcon} from '../img/permanent.svg';
import {ReactComponent as RdIcon} from '../img/rd.svg';

const selected = 'border-3 border-primary selected';

const SelectedCheck = () => {
    return (
        <span className="selected-check">✓</span>
    )
}

const SelectCarbonOffsetProject = () => {
    const [projectType, setProjectType] = useState();

    const history = useHistory();

    function toggleProjectType(type) {
        setProjectType((type === projectType) ? null : type);
    }

    return (
        <div className="container">
            <Row className="justify-content-md-center">
                <Col xs={12} sm={6}>
                    <h3>Choose your offset strategy</h3>
                    <p>We’ll find the best carbon offsets for you to purchase based on what matters the most to you.</p>

                    
                    <Card className={"mb-3 offset-type " + (projectType == 'affordable' && selected)} onClick={() => toggleProjectType('affordable')}>
                        <Row className="g-0">
                            <Col sm={3} className="d-flex align-items-center justify-content-center">
                                <div className="d-flex align-items-center justify-content-center icon-container affordable">
                                    <AffordableIcon />
                                </div>
                            </Col>
                            <Col sm={9}>
                                <Card.Body>
                                    <Card.Title>Price</Card.Title>
                                    <Card.Text>Find the most affordable offset available.</Card.Text>
                                </Card.Body>
                            </Col>
                        </Row>
                        {projectType == 'affordable' && <SelectedCheck />}
                    </Card>
                    <Card className={"mb-3 offset-type " + (projectType == 'local' && selected)} onClick={() => toggleProjectType('local')}>
                        <Row className="g-0">
                            <Col sm={3} className="d-flex align-items-center justify-content-center">
                                <img width="100%" src="https://dogtime.com/assets/uploads/2017/09/pit-bull-puppies-3-1280x720.jpg" />
                            </Col>
                            <Col sm={9}>
                                <Card.Body>
                                    <Card.Title>Local</Card.Title>
                                    <Card.Text>Find the offset that most benefits your local community.</Card.Text>
                                </Card.Body>
                            </Col>
                        </Row>
                        {projectType == 'local' && <SelectedCheck />}
                    </Card>
                    <Card className={"mb-3 offset-type " + (projectType == 'permanent' && selected)} onClick={() => toggleProjectType('permanent')}>
                        <Row className="g-0">
                            <Col sm={3} className="d-flex align-items-center justify-content-center">
                                <div className="d-flex align-items-center justify-content-center icon-container permanent">
                                    <PermanentIcon />
                                </div>
                            </Col>
                            <Col sm={9}>
                                <Card.Body>
                                    <Card.Title>Permanence</Card.Title>
                                    <Card.Text>Find the offset that will have the most lasting benefits.</Card.Text>
                                </Card.Body>
                            </Col>
                        </Row>
                        {projectType == 'permanent' && <SelectedCheck />}
                    </Card>
                    <Card className={"mb-3 offset-type " + (projectType == 'rd' && selected)} onClick={() => toggleProjectType('rd')}>
                        <Row className="g-0">
                            <Col sm={3} className="d-flex align-items-center justify-content-center">
                                <div className="d-flex align-items-center justify-content-center icon-container rd">
                                    <RdIcon />
                                </div>
                            </Col>
                            <Col sm={9}>
                                <Card.Body>
                                    <Card.Title>R&D</Card.Title>
                                    <Card.Text>Find the offset that will fuel technological advancement</Card.Text>
                                </Card.Body>
                            </Col>
                        </Row>
                        {projectType == 'rd' && <SelectedCheck />}
                    </Card>
                    <div className="d-grid">
                        <Button variant="dark" size="lg" disabled={!projectType} onClick={() => history.push(`/select/${projectType}`)}>Find carbon offsets</Button>
                    </div>
                </Col>
            </Row>
        </div>
    );
}

export default SelectCarbonOffsetProject;