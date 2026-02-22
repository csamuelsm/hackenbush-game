import { useState, useEffect } from 'react';

type GameVersion = 'normal' | 'misere'

const useGameVersion = () => {
    const [version, setVersion] = useState<GameVersion>('normal');

    useEffect(() => {
        try {
            const urlParams = new URLSearchParams(window.location.search);
            const versionParam = urlParams.get('misere');

            if (versionParam) {
                const misere = versionParam.toLowerCase() === 'true';
                //console.log('versionParam', versionParam)

                if (misere) {
                    setVersion('misere');
                } else {
                    setVersion('normal');
                }
            } else {
                console.log('NO GAME VERSION PARAMETER FOUND. GAME SET TO NORMAL GAME VERSION.')
            }
        } catch (error) {
            console.error('ERROR DETERMINING GAME VERSION', error);
        }
    }, [])

    return { version };
}

export default useGameVersion;