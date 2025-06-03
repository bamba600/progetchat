export default {
  template: `
    <div class="flex flex-col w-[63%] h-full">
        <!-- Header -->
        <div class="w-full flex bg-[#efe7d7] h-[9.5%] justify-between items-center px-2">
            <div class="flex gap-2 justify-center items-center">
                <div class="rounded-full bg-[#747474] h-[50px] w-[50px]"></div>
                <div class="text-gray-600">Sélectionner un contact</div>
            </div>
            <div class="flex gap-3">
                <div class="rounded-full border-[orange] border-solid border-[2px] h-[30px] w-[30px] flex justify-center items-center">
                    <img src="/images/del.svg" class="h-[20px] w-[20px]"/>
                </div>
                <div id="conversation-archive-btn" class="rounded-full border-[#747474] border-solid border-[2px] h-[30px] w-[30px] flex justify-center items-center cursor-pointer">
                    <img src="/images/ar2.svg" class="h-[15px] w-[15px]"/>
                </div>
                <div class="rounded-full border-[black] border-solid border-[2px] h-[30px] w-[30px] flex justify-center items-center">
                    <img src="/images/cr.svg" class="h-[15px] w-[15px]"/>
                </div>
                <div class="rounded-full border-[red] border-solid border-[2px] h-[30px] w-[30px] flex justify-center items-center">
                    <img src="/images/tr.svg" class="h-[15px] w-[15px]"/>
                </div>
            </div>
        </div>
        
        <!-- Separator -->
        <div class="w-full flex bg-[white] h-[0.2%]"></div>
        
        <!-- Messages Area -->
        <div class="w-full flex bg-[#efe7d7] h-[81%]">
            <div class="w-full h-full flex flex-col gap-3 p-4 overflow-y-auto">
                <!-- Les messages seront ajoutés dynamiquement ici -->
            </div>
        </div>
        
        <!-- Input Area -->
        <div class="w-full flex bg-[white] h-[9.3%] flex gap-1 items-center px-2">
            <input type="text" class="w-[94%] h-[50px] rounded-xl outline-none bg-[#f2eff0] p-5" placeholder="Tapez votre message..."/>
            <div class="w-[50px] h-[50px] rounded-full flex bg-[#41cc3e] justify-center items-center text-[22px] text-white cursor-pointer hover:bg-[#3bb838] transition-colors">
                &#x2794;
            </div>
        </div>
    </div>
  `
};