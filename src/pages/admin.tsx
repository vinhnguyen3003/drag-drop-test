import { useEffect, useState } from 'react'
import { BTN_TYPE_KEY, LOCAL_STORAGE_KEY, PARAGRAPH_TYPE_KEY, TEXT_BTN_DEFAULT, TEXT_DEFAULT } from '../constants'
import { exportJson, importJson } from '../utils'
import { IConfigs } from '../@types'

function Admin() {
    const [configs, setConfigs] = useState<IConfigs>([])
    const [draggingEl, setDraggingEl] = useState<string>('')
    const [focusEl, setFocusEl] = useState<string>('')
    const [isSaved, setIsSaved] = useState<boolean>(false)
    const [isImport, setIsImport] = useState<boolean>(false)
    const [history, setHistory] = useState<Array<IConfigs>>([])
    const [step, setStep] = useState<number>(-1)

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, type: string) => {
        setDraggingEl(type)
        e.dataTransfer.setData("type", type);
    }

    const handleDropOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
    }

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        const type = e.dataTransfer.getData("type");
        setConfigs(prev => ([
            ...prev,
            {
                id: Date.now().toString(),
                type,
                props: {
                    text: type === BTN_TYPE_KEY ? TEXT_BTN_DEFAULT : TEXT_DEFAULT,
                    message: TEXT_DEFAULT
                }
            }
        ]))
        setDraggingEl('')
    }

    const handleFocus = (id: string) => {
        setFocusEl(id)
    }

    const handleBlur = (e: React.FocusEvent<HTMLDivElement | HTMLSpanElement>, key: 'text' | 'message', id: string) => {
        const findConfigValue = configs.find(config => config.id === id)?.props

        let currValue = e.target?.innerText
        if(findConfigValue?.[key].toString() !== currValue) {
            setIsSaved(false)
        }
        if(!currValue) currValue = TEXT_DEFAULT

        const newConfigs = [...configs].map(config => config.id !== id ? config : {
            ...config,
            props: {
                ...config.props,
                [key]: currValue
            }
        })
        e.target.innerHTML = currValue
        setConfigs(newConfigs)
    }

    const handleSave = (data: IConfigs) => {
        setIsSaved(true)
        const newHistory = [...history, data]
        setHistory(newHistory)
        setStep(newHistory.length - 1)
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(configs))
    }

    const handleExport = () => {
        const jsonStr = configs?.length ? JSON.stringify(configs) : null
        if(jsonStr) exportJson(jsonStr)
    }

    const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
        importJson(e, (jsonData) => {
            if(jsonData) {
                const configData = JSON.parse(jsonData)
                if(!Array.isArray(configData)) {
                    alert('Import Fail')
                    return
                }
                setConfigs(configData)
                setIsImport(false)
                handleSave(configData)
            } else {
                alert('Import Fail')
            }
        })
    }

    const viewInNewTab = (url: string) => {
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    const renderConfig = () => {
        return configs.map((config, index) => {
            const {id, type, props} = config
            if(type === BTN_TYPE_KEY) {
                return <div className='btn-config' key={index}>
                    <div 
                        className='btn' 
                        contentEditable={true} 
                        suppressContentEditableWarning={true}
                        onFocus={() => handleFocus(id)}
                        onBlur={(e) => handleBlur(e, 'text', id)}
                        dangerouslySetInnerHTML={{__html: props.text}}
                    />
                    <div className='alert-box'>
                        <span>Alert:</span>
                        <span
                            contentEditable={true} 
                            suppressContentEditableWarning={true}
                            onFocus={() => handleFocus(id)}
                            onBlur={(e) => handleBlur(e, 'message', id)}
                            dangerouslySetInnerHTML={{__html: props.message}}
                        />
                    </div>
                </div>
            } 
            else if(type === PARAGRAPH_TYPE_KEY) {
                return <span 
                    key={index}
                    contentEditable={true} 
                    suppressContentEditableWarning={true}
                    onFocus={() => handleFocus(id)}
                    onBlur={(e) => handleBlur(e, 'text', id)}
                    dangerouslySetInnerHTML={{__html: props.text}}
                />
            }
        })
    }
    useEffect(() => {
        step >= 0 && step <= history.length - 1 && setConfigs(history[step] || [])
        step < 0 && setConfigs([])
        focusEl && setFocusEl('')
    }, [step])

    return (
        <div className='container'>
            <div className='admin-header'>
                <button 
                    disabled={configs?.length === 0 || isSaved}
                    onClick={() => handleSave(configs)}
                >
                    Save
                </button>
                <button
                    disabled={step < 0}
                    onClick={() => setStep(step - 1)}
                >
                    Undo
                </button>
                <button
                    disabled={step >= history.length - 1}
                    onClick={() => setStep(step + 1)}
                >
                    Redo
                </button>
                <button 
                    disabled={!isSaved}
                    onClick={handleExport}
                >
                    Export
                </button>
                <button 
                    onClick={() => setIsImport(!isImport)}
                >
                    Import
                </button>
                <button 
                    disabled={!isSaved}
                    onClick={() => viewInNewTab('/consumer')}
                >
                    View
                </button>
            </div>
            <div className='admin-body'>
                <div className='admin-body__left'>
                    <div 
                        className='tool-item' 
                        draggable={true} 
                        onDragStart={(e) => handleDragStart(e, PARAGRAPH_TYPE_KEY)}
                    >
                        <div />
                        <span>Paragraph</span>
                    </div>
                    <div 
                        className='tool-item' 
                        draggable={true} 
                        onDragStart={(e) => handleDragStart(e, BTN_TYPE_KEY)}
                    >
                        <div />
                        <span>Button</span>
                    </div>
                </div>
                {
                    isImport ?
                    <div className='admin-body__right'>
                        <div className='upload-box'>
                            <input type='file' onChange={handleImport} accept='.json'/>
                            <button
                                onClick={() => setIsImport(false)}
                            >
                                Back
                            </button>
                        </div>
                    </div> :
                    <div className='admin-body__right'>
                        <div 
                            className='body-right-config' 
                            onDragOver={handleDropOver} 
                            onDrop={handleDrop}
                        >
                            {
                                configs?.length ? 
                                renderConfig() : 
                                <div className='init-text'>
                                    Drag & Drop to start
                                </div>
                            }
                        </div>
                        <div className='body-right-info'>
                            <div className='info-item'>
                                <span>Dragging:</span>
                                <span>{draggingEl ? `${draggingEl} Element` : ''}</span>
                            </div>
                            <div className='info-item'>
                                <span>Instances:</span>
                                <span>{configs?.length}</span>
                            </div>
                            <div className='info-item'>
                                <span>Config Json:</span>
                                <span>
                                    {JSON.stringify(configs?.find(config => config.id === focusEl) || '')}
                                </span>
                            </div>
                        </div>
                    </div>
                }
            </div>
        </div>
    )
}

export default Admin
