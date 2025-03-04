// React Imports
import type { SVGAttributes } from 'react'

const Rocket = (props: SVGAttributes<SVGElement>) => {
  return (
    <svg xmlns='http://www.w3.org/2000/svg' width='58' height='58' viewBox='0 0 58 58' fill='none' {...props}>
      <path
        opacity='0.2'
        fillRule='evenodd'
        clipRule='evenodd'
        d='M48.2351 33.622L41.1211 25.0806C41.393 30.3142 40.1016 36.4087 36.1141 43.3642L42.9109 48.8017C43.1526 48.9936 43.4393 49.1206 43.7438 49.1707C44.0484 49.2208 44.3607 49.1924 44.6511 49.088C44.9415 48.9836 45.2005 48.8068 45.4035 48.5743C45.6065 48.3418 45.7467 48.0613 45.8109 47.7595L48.5976 35.1626C48.6648 34.8955 48.667 34.6162 48.6039 34.3482C48.5408 34.0801 48.4144 33.8311 48.2351 33.622ZM9.62888 33.7579L16.7429 25.2392C16.4711 30.4728 17.7625 36.5673 21.75 43.5001L14.9531 48.9376C14.7129 49.1295 14.4279 49.2571 14.1248 49.3086C13.8217 49.36 13.5106 49.3334 13.2206 49.2315C12.9305 49.1295 12.6712 48.9555 12.467 48.7257C12.2628 48.496 12.1203 48.218 12.0531 47.9181L9.26638 35.2985C9.1992 35.0315 9.19705 34.7522 9.26013 34.4841C9.3232 34.216 9.44966 33.967 9.62888 33.7579Z'
        fill='var(--mui-palette-text-secondary)'
      />
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M27.235 3.71108C27.7312 3.30017 28.3554 3.0752 28.9999 3.0752C29.6459 3.0752 30.2715 3.30123 30.7683 3.71401C32.9648 5.5023 37.7192 9.93877 40.3437 16.7607C41.2551 19.1297 41.9046 21.7739 42.1067 24.6786L49.1354 33.113C49.416 33.4423 49.6141 33.8338 49.7132 34.255C49.8117 34.6735 49.8096 35.1093 49.7073 35.5267L46.9233 48.1337L46.9226 48.1368C46.8183 48.6023 46.5973 49.0335 46.2804 49.3901C45.9635 49.7466 45.5611 50.0167 45.1111 50.1749C44.6611 50.3331 44.1782 50.3742 43.7079 50.2944C43.2376 50.2147 42.7953 50.0166 42.4226 49.7188L42.4222 49.7184L35.8992 44.5001H22.1007L15.5778 49.7185L15.5773 49.7188C15.2046 50.0166 14.7624 50.2147 14.2921 50.2945C13.8218 50.3742 13.3389 50.3331 12.8889 50.1749C12.4389 50.0167 12.0365 49.7466 11.7196 49.3901C11.4027 49.0335 11.1817 48.6023 11.0773 48.1368L11.0766 48.1337L8.29268 35.5267C8.19032 35.1093 8.18824 34.6735 8.28671 34.2551C8.38587 33.8336 8.58413 33.4419 8.86498 33.1125L15.7606 24.8553C15.9445 21.8771 16.6066 19.1696 17.5467 16.7492C20.1971 9.92547 25.0133 5.48967 27.235 3.71108ZM40.1374 25.2386C40.1225 25.1574 40.1179 25.0749 40.1232 24.993C39.9491 22.2128 39.3336 19.7052 38.4771 17.4788C36.0283 11.1136 31.5663 6.9421 29.5015 5.26164L29.4916 5.25361L29.4917 5.25355C29.3537 5.13832 29.1796 5.0752 28.9999 5.0752C28.8201 5.0752 28.646 5.13832 28.5081 5.25355L28.4917 5.2669C26.4054 6.93601 21.8836 11.1073 19.411 17.4733C18.5219 19.7624 17.8919 22.3493 17.7428 25.2244C17.7435 25.2675 17.7414 25.3106 17.7365 25.3535C17.5077 30.2531 18.6768 35.9842 22.3314 42.5001H35.6625C39.2712 35.9326 40.398 30.1631 40.1374 25.2386ZM47.6029 34.3981L42.1455 27.8492C41.9426 32.4349 40.608 37.5836 37.5337 43.2464L43.6711 48.1563C43.7787 48.2423 43.9065 48.2996 44.0424 48.3226C44.1782 48.3457 44.3177 48.3338 44.4477 48.2881C44.5777 48.2424 44.694 48.1643 44.7855 48.0614C44.8768 47.9586 44.9406 47.8345 44.9708 47.7004L44.9711 47.6993L47.7571 35.0829L47.7604 35.0683L47.7638 35.0546C47.792 34.9426 47.7929 34.8255 47.7664 34.7131C47.74 34.6007 47.687 34.4963 47.6118 34.4087L47.6028 34.3981L47.6029 34.3981ZM15.7471 27.9917L10.3964 34.3989L10.3882 34.4087L10.3881 34.4087C10.313 34.4963 10.26 34.6007 10.2335 34.7131C10.2071 34.8255 10.208 34.9426 10.2362 35.0546C10.2385 35.064 10.2408 35.0734 10.2429 35.0829L13.0289 47.6993L13.0292 47.7005C13.0594 47.8345 13.1232 47.9587 13.2144 48.0614C13.306 48.1644 13.4222 48.2424 13.5522 48.2881C13.6822 48.3338 13.8217 48.3457 13.9576 48.3226C14.0934 48.2996 14.2212 48.2424 14.3289 48.1563L20.4604 43.2511C17.3566 37.6471 15.985 32.5444 15.7471 27.9917ZM24.375 50.7501C24.375 50.1978 24.8227 49.7501 25.375 49.7501H32.625C33.1773 49.7501 33.625 50.1978 33.625 50.7501C33.625 51.3024 33.1773 51.7501 32.625 51.7501H25.375C24.8227 51.7501 24.375 51.3024 24.375 50.7501ZM31.7187 21.7501C31.7187 23.2516 30.5015 24.4688 29 24.4688C27.4985 24.4688 26.2812 23.2516 26.2812 21.7501C26.2812 20.2486 27.4985 19.0313 29 19.0313C30.5015 19.0313 31.7187 20.2486 31.7187 21.7501Z'
        fill='var(--mui-palette-text-secondary)'
      />
    </svg>
  )
}

export default Rocket
