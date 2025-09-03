import React from 'react';
import { Link } from 'react-router-dom';

const getBrandFilterValue = (footerBrand: string): string => {
	switch (footerBrand) {
		case 'ADIDAS':
			return 'adidas';
		case 'HOKA':
			return 'Hoka One One';
		case 'JORDAN':
			return 'Jordan,Air Jordan'; // Include both Jordan brands
		case 'NIKE':
			return 'Nike';
		case 'NEW BALANCE':
			return 'New Balance';
		case 'ASICS':
			return 'ASICS';
		default:
			return footerBrand;
	}
};

const FOOTER_BRANDS = [
	{
		brand: 'NIKE',
		displayName: 'Nike',
		shoes: [
			{ id: 'b62b550f-0f12-4717-9ce4-4efc7f938a0d', name: 'Nike Kobe 6 Protro Dodgers' },
			{ id: 'aec68b9b-eb62-4e0c-8da3-eee6ce1dadc9', name: 'Nike Kobe 6 Protro Sail All-Star' },
			{ id: '306e3e4b-8a21-4aa8-ac36-3a2fccb0e262', name: 'Supreme x Air Max 1 \'87 SP \'Triple White\''},
			{ id: 'f422be92-e733-4ef0-962b-e19ec798212e', name: 'Corteiz x Air Max 95 SP \'Honey Blacks\''},
			{ id: 'f76a7cac-38a2-40c3-8546-01ba0f4ccbe6', name: 'Vomero 18 \'Black Coconut Milk\''}
		],
	},
	{
		brand: 'JORDAN',
		displayName: 'Jordan',
		shoes: [
			{ id: '724a1c4b-30e3-4ac4-b289-bbb7e868c26e', name: 'Air Jordan 4 Retro OG SP Nigel Sylvester \'Brick by Brick\'' },
			{ id: '4a6eb94c-233b-497d-a51c-ede6740072e7', name: 'Jordan 4 Retro White Cement (2025)' },
			{ id: '0164a95e-9f85-4182-b26c-1d43d8178466', name: 'Jordan 1 Retro High \'85 OG Bred (2025)' },
			{ id: '307833c8-77c4-4563-84e9-c1ba41cf3419', name: 'Jordan 5 Retro OG Black Metallic Reimagined' },
			{ id: 'd9d3ab09-e2eb-41fa-9a1e-60f993dc9351', name: 'Jordan 3 Retro OG Rare Air' }
		],
	},
	{
		brand: 'ADIDAS',
		displayName: 'Adidas',
		shoes: [
			{ id: '9aef7515-d4ac-4c9b-8324-04ffe70546b5', name: 'Bad Bunny x Ballerina \'Black Chalk\'' },
			{ id: '9616830c-7bbd-420b-b599-a5961c3342e1', name: 'Avavav x Wmns Moonrubber Megaride \'Off White\'' },
			{ id: '7660f3b1-0d9b-4106-b032-08b3b69268fd', name: 'adidas AE 1 Low Metamorphosis' },
			{ id: 'bafbb408-6c8e-4faa-b1da-19d12076f02d', name: 'adidas Taekwondo White Black' },
			{ id: '29a49eea-196d-445c-9ed2-5395fd692c2e', name: 'Lionel Messi x Samba \'Inter Miami CF - Debossed Away Kit\'' }
		],
	},
	{
		brand: 'NEW BALANCE',
		displayName: 'New Balance',
		shoes: [
			{ id: 'aa2ec912-f82b-44b5-b783-f0f5f90c0975', name: 'Teddy Santis x 991v2 Made in England \'Celestial Blue\'' },
			{ id: 'cac3024a-a985-4389-8e1e-d857aef6306e', name: 'ABZORB 2000 \'Still Water\'' },
			{ id: '702055cf-c538-4126-8bc0-71efbc1af8f1', name: 'Concepts x 1000 \'Míle\'' },
			{ id: 'a7fa2acd-b48a-4b55-b527-e3e9c8536894', name: 'Stone Island x 998 Made in USA \'Raso Gommato\'' },
			{ id: '4d9b03c6-9f64-4082-847d-cddcd03bb8b4', name: 'Salehe Bembury x 1500 Made in England \'Growth Be The Tree\'' }
		],
	},
	{
		brand: 'ASICS',
		displayName: 'ASICS',
		shoes: [
			{ id: 'e9301844-c627-4c32-adb7-6688361295f1', name: 'JJJJound x Gel Kayano 14 \'White Midnight Navy\'' },
			{ id: '0f342b55-67a4-4d83-a1f8-3afe9d3669a5', name: 'Kith x Gel Nimbus 10.1 \'White Pure Silver\'' },
			{ id: '69a01845-dc17-4a0d-b133-ac0036880595', name: 'Cecilie Bahnsen x Gel Kayano 20 \'Vanilla Pure Silver\'' },
			{ id: '6ee4f5ae-efdd-4295-b309-ce1cdadf99ac', name: 'GT 2160 \'Miami Dolphins\'' },
			{ id: '8df6ada5-44b5-49ec-8174-a3d2ee72abe7', name: 'A.P.C. x Gel Kayano 14 \'White Pure Silver\'' }
		],
	},
	{
		brand: 'HOKA',
		displayName: 'HOKA',
		shoes: [
			{ id: '16f36efb-8945-4530-b903-cee7af2b7b4d', name: 'Hoka One One Clifton 9 Dusk Illusion' },
			{ id: '810ba272-0b16-4d5f-b2eb-44e8ec1ac7cc', name: 'Hoka One One Mach 6 Black White' },
			{ id: '27c986f9-d3d1-4263-aa28-3dd52b316684', name: 'Hoka One One Mach X Dusk Cloudless' },
			{ id: 'ebf29787-12ad-4983-8226-9cc7336557c6', name: 'Hoka One One Bondi 8 Lunar Rock' },
			{ id: '88eb16a5-6f2b-48f8-aa4b-aad84b370040', name: 'Hoka One One Speedgoat 5 White Nimbus Cloud' }
		],
	},
];

export const Footer = () => {
	return (
		<div className="bg-black text-white text-xs pt-10 lg:text-lg">
			<div className="container mx-auto px-4 max-w-7xl flex justify-center py-5 border-0 border-b border-solid border-gray-400 lg:hidden">
				{FOOTER_BRANDS.map((brandData) => (
					<div key={brandData.brand} className="w-1/6 px-4 lg:w-full lg:flex lg:flex-col lg:mb-4">
						<div>
							<Link
								to={`/shoes?brands=${encodeURIComponent(getBrandFilterValue(brandData.brand))}`}
								className="text-sm lg:text-2xl"
							>
								{brandData.displayName}
							</Link>
						</div>
						{brandData.shoes.map((shoe) => (
							<div key={shoe.id} className="mt-1">
								<Link to={`/shoe/${shoe.id}`} className="text-gray-400">
									{shoe.name}
								</Link>
							</div>
						))}
					</div>
				))}
			</div>

			<div className="container mx-auto px-4 py-4 max-w-7xl flex justify-between items-center lg:flex-col lg:gap-2 lg:text-xs">
				<div className="flex gap-4 text-gray-400">
					<div className="cursor-pointer">Terms</div>
					<div className="cursor-pointer">Privacy</div>
					<div className="cursor-pointer">Press</div>
					<div className="cursor-pointer">Jobs</div>
				</div>

				<div className="text-gray-400">&#169; Sneaker Palace LLC. All Rights Reserved</div>

				<div className="text-2xl">
					<i className="fab fa-twitter-square mr-3 cursor-pointer"></i>
					<i className="fab fa-facebook-square mr-3 cursor-pointer"></i>
					<i className="fab fa-instagram-square mr-3 cursor-pointer"></i>
					<i className="fab fa-youtube-square mr-3 cursor-pointer"></i>
				</div>
			</div>
		</div>
	);
};
