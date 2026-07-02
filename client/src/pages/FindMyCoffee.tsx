import { useEffect, useMemo, useState } from 'react';
import { type Bean } from '../types/index.js';
import NavBar from '../components/NavBar.js';
import { supabase } from '../lib/supabase.js';

type AnswerKey = 'brew' | 'flavour' | 'adventure' | 'cup' | 'occasion';

type AnswerMap = Partial<Record<AnswerKey, string>>;

type Question = {
    key: AnswerKey;
    question: string;
    options: string[];
};

const questions: Question[] = [ // questions for the quiz to figure out what kind of coffee the user might like
    {
        key: 'brew',
        question: 'What do you usually brew?',
        options: ['Filter coffee', 'Espresso', 'Both', "I'm not sure yet"],
    },
    {

        key: 'flavour',
        question: 'What kind of flavours sound good to you?',
        options: ['Fruity', 'Chocolatey', 'Nutty', 'Floral', 'Sweet and Caramel-like', 'Im open to anything!'],
    },
    {
        key: 'adventure',
        question: 'How adventurous are you with trying new coffees?',
        options: ['Safe and familiar', 'Balanced', 'Adventurous and interesting'],
    },
    {
        key: 'cup',
        question: 'What kind of cup do you prefer?',
        options: ['Bright and Juicy', 'Smooth and Mellow', 'Rich and Full-bodied', 'Clean and Tea-like', 'No preference'],
    },
    {
        key: 'occasion',
        question: 'What are you looking for today?',
        options: ['Easy daily drinker', 'Something special', 'Surprise me!'],
    },
];


function splitNotes(notes?: string) { // Splits a bean's tasting notes into smaller note pills.
    if (!notes) return [];
    return notes.split(/,|;/).map(note => note.trim()).filter(Boolean).slice(0, 3);
}

function money(price?: number) { // Formats the price for display
    if (!price) return 'N/A';
    return `S$${price.toFixed(2)}`;
}

function hasText(bean: Bean, words: string[]) {
    const text = [
        bean.flavourNotes,
        bean.roastLevel,
        bean.processingMethod,
        bean.varietal,
        bean.region
    ].join(' ').toLowerCase();

    return words.some(word => text.includes(word));

}

function scoreBean(bean: Bean, answers: AnswerMap) { // Scores one bean against the user's quiz answers.
    let score = 0;
    const reasons: string[] = [];

    if (!bean.name || !bean.roaster?.name) return { score: -1, reasons };

    if (answers.brew === 'Filter coffee' && hasText(bean, ['filter', 'light'])) {
        score += 3;
        reasons.push('Matches your preference for filter coffee');
    }

    if (answers.brew === 'Espresso' && hasText(bean, ['espresso', 'medium', 'dark'])) {
        score += 3;
        reasons.push('Works well for espresso');
    }

    if (answers.brew === 'Both' && hasText(bean, ['filter', 'light', 'espresso', 'medium', 'dark'])) {
        score += 3;
        reasons.push('Works well for both filter and espresso');
    }

    const flavourGroups: Record<string, string[]> = { // flavour groups for the quiz and sorting the beans into these categories
        Fruity: ['berry', 'grape', 'plum', 'raisin', 'cherry', 'citrus', 'orange', 'peach', 'mango', 'apple', 'pear'],
        Chocolatey: ['chocolate', 'cacao', 'cocoa', 'mocha', 'brownie'],
        Floral: ['floral', 'jasmine', 'lavender', 'rose', 'bergamot'],
        Nutty: ['nut', 'almond', 'hazelnut', 'peanut', 'walnut'],
        'Sweet and caramel-like': ['caramel', 'brown sugar', 'honey', 'toffee', 'vanilla', 'molasses'],
    };

    const flavourAnswer = answers.flavour;
    const flavourWords = flavourAnswer ? flavourGroups[flavourAnswer] : undefined;
    if (flavourAnswer&&flavourWords && hasText(bean, flavourWords)) {
        score += 4;
        reasons.push(`Matches your preference for ${flavourAnswer.toLowerCase()} flavours`);
    }

    if (answers.adventure === 'Safe and familiar' && hasText(bean, ['washed', 'chocolate', 'nut', 'caramel'])) {
        score += 2;
        reasons.push('A clean and approachable profile');
    }

    if (answers.adventure === 'Balanced' && hasText(bean, ['washed', 'honey'])) {
        score += 2;
        reasons.push('Balanced between familiar and expressive');
    }

    if (answers.adventure === 'Adventurous and interesting' && hasText(bean, ['natural', 'anaerobic', 'honey', 'fermented', 'macarated', 'experimental'])) {
        score += 2;
        reasons.push(`${bean.processingMethod || 'Its process'} gives it a more expressive profile`);
    }

    if (answers.cup === 'Bright and juicy' && hasText(bean, ['citrus', 'orange', 'lemon', 'berry', 'grape', 'juicy', 'bright'])) {
        score += 2;
        reasons.push('Bright fruit notes line up with your cup preference');
    }

    if (answers.cup === 'Smooth and mellow' && hasText(bean, ['smooth', 'mellow', 'chocolate', 'caramel', 'nutty'])) {
        score += 2;
        reasons.push('A smoother profile for an easy cup');
    }

    if (answers.cup === 'Rich and full-bodied' && hasText(bean, ['full-bodied', 'body', 'creamy', 'syrupy', 'chocolate'])) {
        score += 2;
        reasons.push('More body and richness than a delicate coffee');
    }

    if (answers.cup === 'Clean and tea-like' && hasText(bean, ['tea', 'jasmine', 'floral', 'clean', 'delicate'])) {
        score += 2;
        reasons.push('Comfortable enough for a daily brew');
    }

    if (answers.occasion === 'Easy daily drinker' && hasText(bean, ['washed', 'chocolate', 'nut', 'caramel', 'filter', 'espresso'])) {
        score += 2;
        reasons.push('Comfortable enough for a daily brew');
    }

    if (answers.occasion === 'Something special' && hasText(bean, ['natural', 'anaerobic', 'gesha', 'sidra', 'floral', 'tropical'])) {
        score += 2;
        reasons.push('Feels more distinctive than a regular daily coffee');
    }

    if (bean.imageUrl) score += 1;
    if (bean.flavourNotes) score += 1;
    if (bean.processingMethod) score += 1;

    return { score, reasons };
}

function recommendBean(beans: Bean[], answers: AnswerMap) { //score all beans, rank them form, best to worst
    const scored = beans
    .map(bean => ({ bean, ...scoreBean(bean, answers) }))
    .filter(item => item.score >= 0)
    .sort((a, b) => b.score - a.score);

    if (answers.occasion === 'Surprise me') {
        return scored.slice(0,8).sort(() => Math.random() - 0.5).slice(0,3);
    }

    return scored.slice(0, 3); // return top three ranked matches
}

function matchPoints(score: number, bestScore: number) { // scale the score to 100 for display
    if (bestScore <= 0) return 70;
    return Math.max(60, Math.round((score / bestScore) * 100));
}


export default function FindMyCoffee() { //page components
    const [beans, setBeans] = useState<Bean[]>([]);
    const [loading, setLoading] = useState(true);
    const [step, setStep] = useState(0);
    const [answers, setAnswers] = useState<AnswerMap>({});
    const [showResult, setShowResult] = useState(false);
    const [finding, setFinding] = useState(false);

    useEffect(() => {
        fetch(`${import.meta.env.VITE_API_URL}/beans`)
            .then(response => response.json())
            .then(data => setBeans(data))
            .catch(error => console.error('Error fetching beans:', error))
            .finally(() => setLoading(false));
    }, []);

    const currentQuestion = questions[step];
    const selectedAnswer = answers[currentQuestion.key];

    const matches = useMemo(() => {
        if (!showResult) return [];
        return recommendBean(beans, answers);
    }, [beans, answers, showResult]);

    const bestScore = matches[0]?.score ?? 0;

    const displayMatches = [matches[1], matches[0], matches[2]].filter(Boolean); // visual order 2nd place, 1st place, 3rd place.

    function chooseOption(option: string) {
        setAnswers(prev => ({
            ...prev,
            [currentQuestion.key]: option,
        }));
    }

    function goNext() { //next question
        if (step < questions.length - 1) {
            setStep(step + 1);
            return;
        }

        setFinding(true);
        setTimeout(() => {
            setFinding(false);
            setShowResult(true);
        }, 1000);
    }

    function restart(){ // restart quiz
        setStep(0);
        setAnswers({});
        setShowResult(false);
        setFinding(false);
    }

    async function saveBean(beanId: string) {
        const { data } = await supabase.auth.getSession();
        const token = data.session?.access_token;

        if (!token) {
            window.location.href = '/login'; // if not logged in, redirect to login page
            return;
        }

        await fetch(`${import.meta.env.VITE_API_URL}/me/saved-beans`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ beanId }),
        });
    }

    const progress = ((step + 1) / questions.length) * 100;

    return (
        <div className="find-page">
            <NavBar />

            <main className="find-shell">
                <div className="find-heading">
                    <h1>Find My Bean</h1>
                    <p>Answer a few questions and we'll match you with a coffee from local roasters.</p>
                </div>
                
                {loading || finding ? (
                    <section className="finding-state">
                        <div className="spinner" />
                        <h2>Finding your match...</h2>
                        <p>Searching through our collection of specialty beans...</p>
                    </section>
                ) : showResult ? (
                    <section className="result-wrap">
                        <p className="eyebrow">Your Matches</p>
                        <h2> We found the coffee for you.</h2>

                        {matches.length > 0 ? (
                            <>
                                <div className="match-comparison-grid">
                                    {displayMatches.map(match => {
                                        const actualRank = matches.findIndex(item => item.bean.id === match.bean.id) + 1;
                                        const isBest = actualRank === 1;
                                        const points = matchPoints(match.score, bestScore);

                                        return (
                                            <article className={isBest ? 'match-card ranked-card best-match-card' : 'match-card ranked-card'} key={match.bean.id}>
                                                <div className="rank-badge">{actualRank === 1 ? '1st' : actualRank === 2 ? '2nd' : '3rd'}</div>

                                                {isBest && <strong className="recommended-badge">Recommended</strong>}

                                                <div className="match-image">
                                                    {match.bean.imageUrl ? (
                                                        <img src={match.bean.imageUrl} alt={match.bean.name} />
                                                    ) : (
                                                        <span>Recommended</span>
                                                    )}
                                                </div>

                                                <div className="match-body">
                                                    <p className="match-roaster">{match.bean.roaster?.name || 'Local Roaster'}</p>
                                                    <h3>{match.bean.name}</h3>

                                                    <div className="notes-list">
                                                        {splitNotes(match.bean.flavourNotes).length > 0 ? (
                                                            splitNotes(match.bean.flavourNotes).map(note => (
                                                                <span className="note-pill" key={note}>{note}</span>
                                                            ))
                                                        ) : (
                                                            <span className="note-pill">N/A</span>
                                                        )}
                                                    </div>

                                                    <div className="match-meta">
                                                        <div>
                                                            <span className="meta-label">Origin</span>
                                                            <p>{match.bean.region || 'N/A'}</p>
                                                        </div>
                                                        <div>
                                                            <span className="meta-label">Process</span>
                                                            <p>{match.bean.processingMethod || 'N/A'}</p>

                                                        </div>
                                                        <div>
                                                            <span className="meta-label">Varietal</span>
                                                            <p>{match.bean.varietal || 'N/A'}</p>
                                                        </div>
                                                        <div>
                                                            <span className="meta-label">Brew Style</span>
                                                            <p>{match.bean.roastLevel || 'N/A'}</p>
                                                        </div>
                                                        <div>
                                                            <span className="meta-label">Price</span>
                                                            <p>{money(match.bean.price)}</p>
                                                        </div>
                                                    </div>

                                                    <div className="why-box">
                                                        <span className="meta-label">Why this matches</span>
                                                        <ul>
                                                            {(match.reasons.length ? match.reasons.slice(0, 3) : ['It is one of the freshest beans in your catalog.']).map(reason => (
                                                                <li key={reason}>{reason}</li>
                                                            ))}
                                                        </ul>
                                                    </div>

                                                    <div className="ranked-actions">
                                                        <strong className="match-points">{points} pts</strong>
                                                        <button onClick={() => saveBean(match.bean.id)}>Save Bean</button>
                                                        <a href={match.bean.url} target="_blank" rel="noreferrer">View Details</a>
                                                    </div>
                                                </div>
                                            </article>
                                        );
                                    })}
                                </div>

                                <div className="try-again-row">
                                    <button className="secondary-action" onClick={restart}>↻ Try Again</button>
                                </div>
                            </>
                        ):(
                            <div className="empty-match">
                                <h2>No match found yet.</h2>
                                <p>Try again after the catalog has been updated.</p>
                                <button onClick={restart}>Try Again</button>
                            </div>
                        )}
                    </section>
                ) : (
                    <>
                        <section className="quiz-area">
                            <div className="progress-row">
                                <div className="progress-track">
                                    <span style={{ width: `${progress}%` }} />
                                </div>
                                <span>{step + 1} of {questions.length}</span>
                            </div>

                            <div className="quiz-card">
                                <h2>{currentQuestion.question}</h2>

                                <div className={`option-grid ${currentQuestion.options.length > 4 ? 'two-col' : ''}`}>
                                    {currentQuestion.options.map(option => (
                                        <button
                                            key={option}
                                            className={selectedAnswer === option ? 'option-button selected': 'option-button'}
                                            onClick={() => chooseOption(option)}
                                        >
                                            {option}
                                            {selectedAnswer === option && <span>›</span>}
                                        </button>
                                    ))}
                                </div>

                                <div className="quiz-actions">
                                    {step > 0 ? (
                                        <button className="back-button" onClick={() => setStep(step - 1)}>← Back</button>
                                    ) : <span />}

                                    <button className="next-button" disabled={!selectedAnswer} onClick={goNext}>
                                        {step === questions.length - 1 ? 'Find My Bean' : 'Next'}
                                    </button>
                                </div>
                            </div>
                        </section>

                        <p className="find-footnote">Recommendations are from Singapore-based roasters only.</p>
                    </>
                )}
                </main>
        </div>
    );      
}

                                
                                
                                

                            


                            

                        
                    